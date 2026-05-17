import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || 'noreply@expertlagbe.com.bd';

export async function sendBookingRequestEmail(expertEmail: string, userName: string, scheduledAt: string) {
  await resend.emails.send({
    from: FROM,
    to: expertEmail,
    subject: `নতুন বুকিং রিকোয়েস্ট - ${userName}`,
    html: `<p>${userName} আপনার সাথে পরামর্শ করতে চান। সময়: ${scheduledAt}। দয়া করে ২ ঘণ্টার মধ্যে সাড়া দিন।</p>`,
  });
}

export async function sendBookingConfirmedEmail(userEmail: string, expertName: string, scheduledAt: string) {
  await resend.emails.send({
    from: FROM,
    to: userEmail,
    subject: 'বুকিং নিশ্চিত হয়েছে - এখন পেমেন্ট করুন',
    html: `<p>${expertName} আপনার বুকিং গ্রহণ করেছেন। সময়: ${scheduledAt}। এখন পেমেন্ট করে সেশন নিশ্চিত করুন।</p>`,
  });
}

export async function sendPaymentConfirmedEmail(userEmail: string, expertEmail: string, scheduledAt: string) {
  const userHtml = `<p>আপনার পেমেন্ট সফল হয়েছে। সেশন কক্ষ প্রস্তুত। সময়: ${scheduledAt}</p>`;
  const expertHtml = `<p>সেশন নিশ্চিত হয়েছে। সময়: ${scheduledAt}</p>`;

  await Promise.all([
    resend.emails.send({ from: FROM, to: userEmail, subject: 'পেমেন্ট সফল - সেশন কক্ষ প্রস্তুত', html: userHtml }),
    resend.emails.send({ from: FROM, to: expertEmail, subject: 'সেশন নিশ্চিত হয়েছে', html: expertHtml }),
  ]);
}

export async function sendSessionReminderEmail(userEmail: string, expertEmail: string, expertName: string) {
  const html = `<p>${expertName}-এর সাথে আপনার সেশন ১ ঘণ্টার মধ্যে শুরু হবে।</p>`;
  await Promise.all([
    resend.emails.send({ from: FROM, to: userEmail, subject: 'সেশন শুরু হতে ১ ঘণ্টা বাকি', html }),
    resend.emails.send({ from: FROM, to: expertEmail, subject: 'সেশন শুরু হতে ১ ঘণ্টা বাকি', html }),
  ]);
}

export async function sendReviewRequestEmail(userEmail: string, expertName: string) {
  await resend.emails.send({
    from: FROM,
    to: userEmail,
    subject: `${expertName}-কে রিভিউ দিন`,
    html: `<p>আপনার সেশন সম্পন্ন হয়েছে। ${expertName}-কে রেটিং দিয়ে অন্যদের সাহায্য করুন।</p>`,
  });
}

export async function sendPayoutProcessedEmail(expertEmail: string, amount: number) {
  await resend.emails.send({
    from: FROM,
    to: expertEmail,
    subject: 'পেআউট প্রক্রিয়া হয়েছে',
    html: `<p>আপনার ৳${amount} পেআউট প্রক্রিয়া করা হয়েছে।</p>`,
  });
}

export async function sendExpertVerifiedEmail(expertEmail: string) {
  await resend.emails.send({
    from: FROM,
    to: expertEmail,
    subject: 'আপনার প্রোফাইল লাইভ হয়েছে!',
    html: `<p>অভিনন্দন! আপনার বিশেষজ্ঞ প্রোফাইল যাচাই হয়েছে এবং এখন সকলের কাছে দৃশ্যমান।</p>`,
  });
}

export async function sendExpertRejectedEmail(expertEmail: string, reason: string) {
  await resend.emails.send({
    from: FROM,
    to: expertEmail,
    subject: 'যাচাইকরণ আপডেট - পদক্ষেপ প্রয়োজন',
    html: `<p>আপনার প্রোফাইল যাচাই করা সম্ভব হয়নি। কারণ: ${reason}। অনুগ্রহ করে ডকুমেন্ট আপডেট করুন।</p>`,
  });
}
