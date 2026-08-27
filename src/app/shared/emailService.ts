// src/shared/emailService.ts

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ✅ Helper — items HTML table বানায়
const buildItemsHtml = (items: any[]) =>
    items
        .map(
            (item: any) => `
            <tr>
                <td style="padding:8px;border:1px solid #ddd">${item.product.title}</td>
                <td style="padding:8px;border:1px solid #ddd;text-align:center">${item.quantity}</td>
                <td style="padding:8px;border:1px solid #ddd;text-align:right">৳${item.price}</td>
                <td style="padding:8px;border:1px solid #ddd;text-align:right">৳${item.price * item.quantity}</td>
            </tr>
        `,
        )
        .join("");

// ✅ Helper — price summary HTML বানায়
const buildPriceSummaryHtml = (order: any) => `
    <table style="width:100%;border-collapse:collapse">
        <tr>
            <td style="padding:8px;color:#666">সাবটোটাল</td>
            <td style="padding:8px;text-align:right">৳${order.subtotal}</td>
        </tr>
        <tr style="background:#f9f9f9">
            <td style="padding:8px;color:#666">ডেলিভারি চার্জ</td>
            <td style="padding:8px;text-align:right">৳${order.deliveryCharge}</td>
        </tr>
        ${
            order.discount > 0
                ? `<tr>
                <td style="padding:8px;color:green">ডিসকাউন্ট (${order.couponCode})</td>
                <td style="padding:8px;text-align:right;color:green">-৳${order.discount}</td>
               </tr>`
                : ""
        }
        <tr style="background:#ef4444;color:white;font-size:18px;font-weight:bold">
            <td style="padding:12px">সর্বমোট</td>
            <td style="padding:12px;text-align:right">৳${order.totalPrice}</td>
        </tr>
    </table>
`;

// ✅ 1. Admin কে email — সব details সহ
export const sendOrderEmailToAdmin = async (order: any) => {
    const itemsHtml = buildItemsHtml(order.items);

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: "nhsuprim24@gmail.com",
        subject: `🛒 নতুন অর্ডার! — ${order.customerName}`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #eee;border-radius:8px;overflow:hidden">

                <div style="background:#ef4444;padding:20px;text-align:center">
                    <h1 style="color:white;margin:0">নতুন অর্ডার এসেছে! 🎉</h1>
                </div>

                <div style="padding:24px">

                    <h2 style="color:#333;border-bottom:2px solid #ef4444;padding-bottom:8px">
                        👤 কাস্টমার তথ্য
                    </h2>
                    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
                        <tr>
                            <td style="padding:8px;color:#666;width:40%">নাম</td>
                            <td style="padding:8px;font-weight:bold">${order.customerName}</td>
                        </tr>
                        <tr style="background:#f9f9f9">
                            <td style="padding:8px;color:#666">ফোন</td>
                            <td style="padding:8px;font-weight:bold">${order.customerPhn}</td>
                        </tr>
                        <tr>
                            <td style="padding:8px;color:#666">ইমেইল</td>
                            <td style="padding:8px;font-weight:bold">${order.customerEmail || "দেওয়া হয়নি"}</td>
                        </tr>
                        <tr style="background:#f9f9f9">
                            <td style="padding:8px;color:#666">জেলা</td>
                            <td style="padding:8px;font-weight:bold">${order.customerDistrict}</td>
                        </tr>
                        <tr>
                            <td style="padding:8px;color:#666">ঠিকানা</td>
                            <td style="padding:8px;font-weight:bold">${order.customerAddress}</td>
                        </tr>
                    </table>

                    <h2 style="color:#333;border-bottom:2px solid #ef4444;padding-bottom:8px">
                        🛒 অর্ডার আইটেম
                    </h2>
                    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
                        <thead>
                            <tr style="background:#ef4444;color:white">
                                <th style="padding:10px;border:1px solid #ddd;text-align:left">পণ্য</th>
                                <th style="padding:10px;border:1px solid #ddd">পরিমাণ</th>
                                <th style="padding:10px;border:1px solid #ddd">দাম</th>
                                <th style="padding:10px;border:1px solid #ddd">মোট</th>
                            </tr>
                        </thead>
                        <tbody>${itemsHtml}</tbody>
                    </table>

                    <h2 style="color:#333;border-bottom:2px solid #ef4444;padding-bottom:8px">
                        💰 মূল্য সারসংক্ষেপ
                    </h2>
                    ${buildPriceSummaryHtml(order)}

                    <div style="margin-top:24px;background:#f3f4f6;border-radius:8px;padding:12px;text-align:center">
                        <p style="color:#666;margin:0;font-size:12px">অর্ডার আইডি</p>
                        <p style="font-family:monospace;font-weight:bold;margin:4px 0">${order.id}</p>
                    </div>
                </div>
            </div>
        `,
    });
};

// ✅ 2. Customer কে email — confirmation
export const sendOrderEmailToCustomer = async (order: any) => {
    // customer email না থাকলে পাঠাবো না
    if (!order.customerEmail) return;

    const itemsHtml = buildItemsHtml(order.items);

    await transporter.sendMail({
        from: `"SUPREME Shop" <${process.env.EMAIL_USER}>`,
        to: order.customerEmail,
        subject: `✅ আপনার অর্ডার কনফার্ম হয়েছে — #${order.id}`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #eee;border-radius:8px;overflow:hidden">

                <div style="background:#22c55e;padding:20px;text-align:center">
                    <h1 style="color:white;margin:0">আপনার অর্ডার কনফার্ম হয়েছে ✅</h1>
                </div>

                <div style="padding:24px">

                    <p style="color:#555;font-size:15px">
                        প্রিয় <strong>${order.customerName}</strong>,<br/>
                        আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।
                        আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
                    </p>

                    <h2 style="color:#333;border-bottom:2px solid #22c55e;padding-bottom:8px">
                        🛒 আপনার অর্ডার
                    </h2>
                    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
                        <thead>
                            <tr style="background:#22c55e;color:white">
                                <th style="padding:10px;border:1px solid #ddd;text-align:left">পণ্য</th>
                                <th style="padding:10px;border:1px solid #ddd">পরিমাণ</th>
                                <th style="padding:10px;border:1px solid #ddd">দাম</th>
                                <th style="padding:10px;border:1px solid #ddd">মোট</th>
                            </tr>
                        </thead>
                        <tbody>${itemsHtml}</tbody>
                    </table>

                    <h2 style="color:#333;border-bottom:2px solid #22c55e;padding-bottom:8px">
                        💰 মূল্য সারসংক্ষেপ
                    </h2>
                    ${buildPriceSummaryHtml(order)}

                    <!-- Delivery Info -->
                    <h2 style="color:#333;border-bottom:2px solid #22c55e;padding-bottom:8px;margin-top:24px">
                        📦 ডেলিভারি তথ্য
                    </h2>
                    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
                        <tr>
                            <td style="padding:8px;color:#666;width:40%">জেলা</td>
                            <td style="padding:8px;font-weight:bold">${order.customerDistrict}</td>
                        </tr>
                        <tr style="background:#f9f9f9">
                            <td style="padding:8px;color:#666">ঠিকানা</td>
                            <td style="padding:8px;font-weight:bold">${order.customerAddress}</td>
                        </tr>
                        <tr>
                            <td style="padding:8px;color:#666">ফোন</td>
                            <td style="padding:8px;font-weight:bold">${order.customerPhn}</td>
                        </tr>
                    </table>

                    <div style="margin-top:24px;background:#f0fdf4;border:1px solid #22c55e;border-radius:8px;padding:12px;text-align:center">
                        <p style="color:#666;margin:0;font-size:12px">আপনার অর্ডার আইডি</p>
                        <p style="font-family:monospace;font-weight:bold;margin:4px 0;color:#16a34a">${order.id}</p>
                    </div>

                    <p style="color:#999;font-size:12px;text-align:center;margin-top:24px">
                        কোনো সমস্যা হলে আমাদের সাথে যোগাযোগ করুন।<br/>
                        ধন্যবাদ SUPREME Shop এ কেনাকাটার জন্য! 🙏
                    </p>
                </div>
            </div>
        `,
    });
};

// ✅ দুটো একসাথে পাঠানোর shortcut
export const sendOrderEmail = async (order: any) => {
    await Promise.all([
        sendOrderEmailToAdmin(order),
        sendOrderEmailToCustomer(order),
    ]);
};
