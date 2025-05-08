import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentMethod, PaymentStatus } from '../../entities/Payment';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class ZalopayService {
  private readonly logger = new Logger(ZalopayService.name);
  private readonly appId = 2554;
  private readonly key1 = 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn';
  private readonly key2 = 'trMrHtvjo6myautxDUiAcYsVtaeQ8nhf';
  private readonly sandboxEndpoint = 'https://sb-openapi.zalopay.vn/v2';

  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
  ) {}

  hmacSha256(data: string, key: string): string {
    return crypto.createHmac('sha256', key).update(data).digest('hex');
  }

  generateMac(orderData: any): string {
    const hmac_input = `${this.appId}|${orderData.app_trans_id}|${orderData.app_user}|${orderData.amount}|${orderData.app_time}|${orderData.embed_data}|${orderData.item}`;

    this.logger.log(`MAC input: ${hmac_input}`);

    return this.hmacSha256(hmac_input, this.key1);
  }

  async createOrder(
    userId: number,
    courseId: number,
    amount: number,
    description: string,
  ): Promise<any> {
    try {
      // Create local payment record
      const payment = this.paymentsRepository.create({
        userId,
        courseId,
        amount,
        paymentMethod: PaymentMethod.E_WALLET,
        status: PaymentStatus.PENDING,
      });
      await this.paymentsRepository.save(payment);

      // Tạo app_trans_id theo định dạng yêu cầu
      const today = new Date();
      const dateStr = `${today.getFullYear().toString().slice(-2)}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
      const app_trans_id = `${dateStr}_${Date.now()}`;

      // Create ZaloPay order with userId and courseId in redirect URL
      const redirectUrl = `http://localhost:3000/payments/zalopay/return?userId=${userId}&courseId=${courseId}`;
      const embed_data = JSON.stringify({
        preferred_payment_method: [],
        redirecturl: redirectUrl,
      });
      const item = JSON.stringify([]);
      const orderInfo = {
        app_id: this.appId,
        app_trans_id: app_trans_id,
        app_user: `user_${userId}`,
        app_time: Date.now(),
        item: item,
        embed_data: embed_data,
        amount,
        description,
        bank_code: '',
        callback_url: `https://b6ab-103-156-2-66.ngrok-free.app/zalopay/callback`,
      };

      // Tính MAC sử dụng phương thức mới
      orderInfo['mac'] = this.generateMac(orderInfo);

      // Call ZaloPay API
      const response = await axios.post(
        `${this.sandboxEndpoint}/create`,
        orderInfo,
      );

      // Update payment with transaction ID
      if (response.data && response.data.return_code === 1) {
        await this.paymentsRepository.update(payment.id, {
          transactionId: app_trans_id,
        });
      }

      return response.data;
    } catch (error) {
      this.logger.error(`ZaloPay order creation failed: ${error.message}`);
      throw error;
    }
  }

  async verifyCallback(
    callbackData: any,
  ): Promise<{ return_code: number; return_message: string }> {
    this.logger.log(
      `ZaloPay raw callback received: ${JSON.stringify(callbackData)}`,
    );

    try {
      // Extract data string and mac from callback
      const { data: dataStr, mac: reqMac } = callbackData;

      // Verify MAC using key2
      const mac = this.hmacSha256(dataStr, this.key2);
      this.logger.log(`Calculated MAC: ${mac}, Received MAC: ${reqMac}`);

      // Check if MAC matches
      if (reqMac !== mac) {
        this.logger.error('MAC verification failed');
        return { return_code: -1, return_message: 'mac not equal' };
      }

      // Parse the data string
      const dataJson = JSON.parse(dataStr);
      this.logger.log(`Parsed callback data: ${JSON.stringify(dataJson)}`);

      // Find the payment by app_trans_id
      const payment = await this.paymentsRepository.findOne({
        where: { transactionId: dataJson.app_trans_id },
      });

      if (!payment) {
        // Create a new payment if it doesn't exist
        const userId = parseInt(dataJson.app_user.replace('user_', ''), 10);
        const newPayment = this.paymentsRepository.create({
          userId,
          courseId: parseInt(
            dataJson.embed_data.match(/course #(\d+)/)?.[1] || '1',
            10,
          ),
          amount: dataJson.amount,
          paymentMethod: PaymentMethod.E_WALLET,
          transactionId: dataJson.app_trans_id,
          status: PaymentStatus.COMPLETED,
          paymentDate: new Date(),
        });
        await this.paymentsRepository.save(newPayment);
        this.logger.log(
          `Created new payment for transaction: ${dataJson.app_trans_id}`,
        );
        return { return_code: 1, return_message: 'success' };
      }

      // Always mark as completed on callback as ZaloPay only calls back on successful payments
      this.logger.log(`Payment ${payment.id} completed successfully`);
      await this.paymentsRepository.update(payment.id, {
        status: PaymentStatus.COMPLETED,
        paymentDate: new Date(),
      });

      return { return_code: 1, return_message: 'success' };
    } catch (error) {
      this.logger.error(`Error processing ZaloPay callback: ${error.message}`);
      return { return_code: 0, return_message: error.message };
    }
  }

  async getTransactionStatus(appTransId: string): Promise<any> {
    try {
      const data = {
        app_id: this.appId,
        app_trans_id: appTransId,
      };

      // Calculate MAC correctly for the query API
      const mac = this.hmacSha256(
        `${this.appId}|${appTransId}|${this.key1}`,
        this.key1,
      );

      const requestData = {
        ...data,
        mac: mac,
      };

      this.logger.log(`Query transaction status for: ${appTransId}`);
      const response = await axios.post(
        `${this.sandboxEndpoint}/query`,
        requestData,
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get transaction status: ${error.message}`);
      throw error;
    }
  }
}
