import { resend } from '@/lib/resend';
import VerificationEmail from '../emails/VerifEmail';
import { ApResp } from '@/types/ApResponse';

const defaultFrom = 'onboarding@resend.dev';

export async function sendVrfMail(
    email: string,
    username: string,
    verifyCode: string
):  Promise<ApResp> {

    try {
        if (!process.env.RESEND_API_KEY) {
            return { success: false, message: 'RESEND_API_KEY is not configured.' };
        }

        const from = process.env.RESEND_FROM ?? defaultFrom;

        const { data, error } = await resend.emails.send({
            from,
            to: email,
            subject: 'Verification Code',
            react: VerificationEmail({ username, otp: verifyCode }),
        });

        if (error) {
            console.error('Error sending verification email:', error);
            return { success: false, message: error.message ?? 'Failed to send verification email' };
        }

        if (!data?.id) {
            return { success: false, message: 'Email provider did not return a message id.' };
        }

        return { success: true, message: 'Verification email sent successfully.' };
    } 
    catch (error) 
    {
        console.error('Error sending verification email:', error);
        return { success: false, message: 'Failed to send verification email' };
    }
        }
