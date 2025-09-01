import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    const emailConfig = {
      host: this.configService.get('SMTP_HOST', 'localhost'),
      port: parseInt(this.configService.get('SMTP_PORT', '587')),
      secure: this.configService.get('SMTP_SECURE', 'false') === 'true',
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);
  }

  async sendStatusUpdateEmail(
    to: string,
    packageNumber: string,
    status: string,
    customerName: string,
  ) {
    const template = this.loadTemplate('status-update');
    const html = template({
      packageNumber,
      status,
      customerName,
      date: new Date().toLocaleDateString(),
    });

    await this.sendEmail({
      to,
      subject: `Permit Package ${packageNumber} - Status Updated`,
      html,
    });
  }

  async sendDueDateReminder(
    to: string,
    packageNumber: string,
    dueDate: Date,
    customerName: string,
  ) {
    const template = this.loadTemplate('due-date-reminder');
    const html = template({
      packageNumber,
      dueDate: dueDate.toLocaleDateString(),
      customerName,
      daysUntilDue: Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    });

    await this.sendEmail({
      to,
      subject: `Permit Package ${packageNumber} - Due Date Reminder`,
      html,
    });
  }

  async sendWelcomeEmail(to: string, firstName: string) {
    const template = this.loadTemplate('welcome');
    const html = template({
      firstName,
      loginUrl: this.configService.get('FRONTEND_URL', 'http://localhost:3000'),
    });

    await this.sendEmail({
      to,
      subject: 'Welcome to Permit Management System',
      html,
    });
  }

  private loadTemplate(templateName: string): HandlebarsTemplateDelegate {
    try {
      const templatePath = join(__dirname, 'templates', `${templateName}.hbs`);
      const templateContent = readFileSync(templatePath, 'utf-8');
      return handlebars.compile(templateContent);
    } catch (error) {
      this.logger.warn(`Template ${templateName} not found, using default`);
      return handlebars.compile(`
        <h2>{{title}}</h2>
        <p>{{message}}</p>
      `);
    }
  }

  private async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }) {
    try {
      const mailOptions = {
        from: this.configService.get('SMTP_FROM', 'noreply@permitmanagement.com'),
        ...options,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${options.to}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw new Error('Failed to send email');
    }
  }
}
