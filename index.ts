import fs from 'fs';
import path from 'path';

// Исходный массив email'ов
const emails = [
    { fio: 'Иванов Иван Иванович', email: 'example1@email.com' },
    { fio: 'Иванов И И', email: 'example2@email.com' },
    { fio: 'Ли Тан', email: 'example3@email.com' },
    { fio: '', email: 'example4@email.com' },
    { fio: 'Петров Петя', email: 'example5@email.com' },
    { fio: 'Вася Петров', email: 'example5@email.com' },
    { fio: 'Петров Вася', email: 'example999@email.com' }
];

type Email = {
    fio: string;
    email: string;
}

// Файл для хранения уже отправленных email'ов
const SENT_EMAILS_FILE = path.join(__dirname, 'sentEmails.json');

// Загружаем список уже отправленных email'ов
const loadSentEmails = () => {
    if (fs.existsSync(SENT_EMAILS_FILE)) {
        return JSON.parse(fs.readFileSync(SENT_EMAILS_FILE, 'utf8'));
    }
    return [];
};

// Сохраняем обновленный список отправленных email'ов
const saveSentEmails = (sentEmails: Email[]) => {
    fs.writeFileSync(SENT_EMAILS_FILE, JSON.stringify(sentEmails, null, 2), 'utf8');
};

// Функция отправки email (имитация)
async function sendEmail({ email, fio }: Email) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < 0.9) { // 90% шанс успешной отправки
                console.log(`✅ Отправлено: ${email}`);
                resolve({ email, status: 'success' });
            } else {
                console.log(`❌ Ошибка отправки: ${email}`);
                reject({ email, status: 'failed' });
            }
        }, Math.floor(Math.random() * 2000)); // Имитация задержки
    });
}

// Основной процесс рассылки
async function sendBulkEmails() {
    const sentEmails = loadSentEmails(); // Загружаем список отправленных email'ов
    const queue = emails.filter(e => !sentEmails.includes(e.email)); // Фильтруем те, которые уже отправлены

    console.log(`📨 Начинаем отправку. Всего ${queue.length} новых email'ов.`);

    let results = [];
    let count = 0;

    for (let i = 0; i < queue.length; i++) {
        if (count >= 60) {
            console.log('⏳ Достигнут лимит 60 писем в минуту. Ожидание...');
            await new Promise(resolve => setTimeout(resolve, 60000));
            count = 0;
        }

        try {
            const result = await sendEmail(queue[i]);
            results.push(result);
            sentEmails.push(queue[i].email);
            count++;
        } catch (error) {
            results.push(error);
        }
    }

    saveSentEmails(sentEmails); // Сохраняем успешные отправки
    console.log(`✅ Рассылка завершена. Успешно отправлено: ${results.filter(r => r.status === 'success').length}`);
}

// Запуск
sendBulkEmails();