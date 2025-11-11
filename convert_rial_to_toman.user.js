// ==UserScript==
// @name         Convert Rial to Toman in Grouped Format
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Convert selected numbers from Rial to grouped "Toman" format using Persian digits, VazirMatn font, and red-colored "معادل:" (Auto-clear previous result)
// @author       Your Name
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // تابع برای تبدیل عدد به حروف فارسی
    function numberToWords(num) {
        if (num === 0) return 'صفر';

        const units = ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون'];
        const digits = ['صفر', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
        const tens = ['', 'ده', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
        const teens = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];

        let result = '';
        let unitIndex = 0;

        while (num > 0) {
            let chunk = num % 1000;
            if (chunk !== 0) {
                let chunkWords = '';
                let hundreds = Math.floor(chunk / 100);
                let remainder = chunk % 100;

                // پردازش صدگان
                if (hundreds > 0) {
                    chunkWords += digits[hundreds] + ' صد ';
                }

                // پردازش دهگان و یکان
                if (remainder >= 10 && remainder < 20) {
                    chunkWords += teens[remainder - 10] + ' ';
                } else {
                    let ten = Math.floor(remainder / 10);
                    let one = remainder % 10;

                    if (ten > 0) {
                        chunkWords += tens[ten] + ' ';
                    }
                    if (one > 0) {
                        chunkWords += digits[one] + ' ';
                    }
                }

                // اضافه کردن واحد (هزار، میلیون و ...)
                chunkWords += units[unitIndex] + ' ';
                result = chunkWords + result;
            }

            num = Math.floor(num / 1000);
            unitIndex++;
        }

        // حذف فضاهای اضافی از ابتدا و انتهای نتیجه
        return result.trim();
    }

    // تابع برای تبدیل عدد به رقم‌های فارسی
    function toPersianDigits(number) {
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return number.toString().replace(/\d/g, (digit) => persianDigits[digit]);
    }

    // تابع برای نمایش نتیجه در صفحه
    function displayResult(message) {
        let resultElement = document.getElementById('toman-converter-result');

        // اگر عنصر وجود نداشته باشد، آن را ایجاد کنید
        if (!resultElement) {
            resultElement = document.createElement('div');
            resultElement.id = 'toman-converter-result';
            resultElement.style.position = 'fixed';
            resultElement.style.top = '10px';
            resultElement.style.right = '10px';
            resultElement.style.backgroundColor = '#f9f9f9';
            resultElement.style.padding = '15px';
            resultElement.style.border = '1px solid #ddd';
            resultElement.style.borderRadius = '8px';
            resultElement.style.zIndex = '9999';
            resultElement.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            resultElement.style.fontFamily = 'Vazirmatn, Arial, sans-serif';
            resultElement.style.fontSize = '16px';
            resultElement.style.color = '#333';
            resultElement.style.direction = 'rtl';
            resultElement.style.textAlign = 'right';
            document.body.appendChild(resultElement);

            // اضافه کردن فونت VazirMatn به صفحه
            let fontLink = document.createElement('link');
            fontLink.rel = 'stylesheet';
            fontLink.href = 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-FD.css';
            document.head.appendChild(fontLink);

            // اضافه کردن استایل برای کلمه "معادل:"
            let style = document.createElement('style');
            style.innerHTML = `
                #toman-converter-result .red-equivalent {
                    color: red !important;
                    font-weight: bold !important;
                }
            `;
            document.head.appendChild(style);
        }

        // تنظیم متن نهایی با استفاده از HTML
        resultElement.innerHTML = `<span class="red-equivalent">معادل:</span> ${message}`;
    }

    // تابع برای پاک کردن کادر نمایش
    function clearResult() {
        let resultElement = document.getElementById('toman-converter-result');
        if (resultElement) {
            resultElement.remove(); // حذف کامل عنصر از DOM
        }
    }

    // اضافه کردن Event Listener برای انتخاب متن
    document.addEventListener('mouseup', function(event) {
        // دریافت متن انتخاب شده توسط کاربر
        let selectedText = window.getSelection().toString().trim();

        // بررسی اینکه آیا متن انتخاب شده عدد است یا نه
        if (selectedText) {
            let rialValue = parseInt(selectedText.replace(/,/g, ''), 10); // حذف کاما و تبدیل به عدد
            if (!isNaN(rialValue)) {
                // محاسبه تومان
                let tomanValue = Math.floor(rialValue / 10); // قسمت تومان

                // تبدیل تومان به فرمت گروه‌بندی شده
                let billion = Math.floor(tomanValue / 1_000_000_000); // میلیارد
                let million = Math.floor((tomanValue % 1_000_000_000) / 1_000_000); // میلیون
                let thousand = Math.floor((tomanValue % 1_000_000) / 1_000); // هزار
                let remainder = tomanValue % 1_000; // باقیمانده

                // ساخت متن نهایی
                let resultMessage = '';
                if (billion > 0) {
                    resultMessage += `${toPersianDigits(billion)} میلیارد `;
                }
                if (million > 0) {
                    resultMessage += `و ${toPersianDigits(million)} میلیون `;
                }
                if (thousand > 0) {
                    resultMessage += `و ${toPersianDigits(thousand)} هزار `;
                }
                if (remainder > 0 || tomanValue === 0) {
                    resultMessage += `و ${toPersianDigits(remainder)} `;
                }

                // حذف "و" اضافی از ابتدای متن
                resultMessage = resultMessage.replace(/^و /, '');

                // اضافه کردن "تومان" به انتهای متن
                resultMessage += 'تومان';

                // نمایش نتیجه در صفحه
                displayResult(resultMessage);
            } else {
                // اگر متن انتخاب شده عدد نباشد، کادر نمایش پاک شود
                clearResult();
            }
        } else {
            // اگر هیچ متنی انتخاب نشده باشد، کادر نمایش پاک شود
            clearResult();
        }
    });

    // پاک کردن نتیجه وقتی کاربر روی صفحه کلیک می‌کند
    document.addEventListener('mousedown', function(event) {
        let resultElement = document.getElementById('toman-converter-result');
        if (resultElement) {
            resultElement.remove(); // حذف کامل عنصر از DOM
        }
    });
})();
