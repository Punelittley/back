import * as newsDb from "./news";
import * as servicesDb from "./services";
import * as usersDb from "./users";
import { hashPassword } from "../utils/password";

const NEWS = [
  { title: "Открыта запись на УЗИ и ЭКГ", content: "С 1 марта открыта запись на ультразвуковое исследование и электрокардиографию. Запись через личный кабинет или по телефону регистратуры. Скидка 10% при записи через сайт.", imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800", isFeatured: true, priority: 10 },
  { title: "Акция: комплекс анализов со скидкой", content: "До конца месяца действует скидка 15% на комплекс «Общий анализ крови + биохимия + общий анализ мочи». Результаты готовы в течение одного рабочего дня.", imageUrl: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=800", isFeatured: true, priority: 9 },
  { title: "Новый врач-терапевт в клинике", content: "В нашей клинике начинает приём врач-терапевт Ольга Сергеевна Морозова. Опыт работы более 12 лет. Запись на приём уже открыта в разделе «Запись на услугу».", imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800", isFeatured: false, priority: 5 },
  { title: "Изменение графика работы в праздники", content: "8 и 9 марта клиника работает с 9:00 до 15:00. Дежурный врач и процедурный кабинет — по предварительной записи. С 10 марта — обычный режим.", imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800", isFeatured: true, priority: 8 },
  { title: "Напоминание: прививка от гриппа", content: "Рекомендуем сделать прививку от гриппа до конца эпидсезона. Запись на вакцинацию — в личном кабинете, раздел «Запись на услугу». Консультация терапевта включена.", imageUrl: "https://images.unsplash.com/photo-1584483766114-2cea6a2a40f0?w=800", isFeatured: false, priority: 3 },
  { title: "День открытых дверей: бесплатные консультации", content: "15 марта приглашаем на день открытых дверей. С 10:00 до 14:00 — бесплатные консультации терапевта и педиатра, измерение давления и сахара крови. Запись не требуется.", imageUrl: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800", isFeatured: true, priority: 7 },
  { title: "В клинике установлен новый рентген-аппарат", content: "Современный цифровой рентген позволяет получать снимки высокого качества с минимальной лучевой нагрузкой. Запись на рентген грудной клетки, конечностей и других областей — в личном кабинете.", imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800", isFeatured: false, priority: 4 },
];

const SERVICES = [
  { name: "Приём терапевта", description: "Первичный или повторный приём врача-терапевта, осмотр, назначения.", price: 2500, durationMinutes: 30, category: "Консультации" },
  { name: "Приём педиатра", description: "Осмотр ребёнка, консультация по питанию и развитию, назначения.", price: 2200, durationMinutes: 30, category: "Консультации" },
  { name: "Приём кардиолога", description: "Консультация кардиолога, расшифровка ЭКГ, рекомендации.", price: 3500, durationMinutes: 40, category: "Консультации" },
  { name: "Общий анализ крови", description: "Клинический анализ крови с лейкоцитарной формулой (забор из вены).", price: 800, durationMinutes: 15, category: "Анализы" },
  { name: "Биохимический анализ крови", description: "Базовый профиль: глюкоза, печень, почки, липиды.", price: 1800, durationMinutes: 15, category: "Анализы" },
  { name: "Общий анализ мочи", description: "Физико-химическое и микроскопическое исследование.", price: 450, durationMinutes: 10, category: "Анализы" },
  { name: "Гормоны щитовидной железы", description: "ТТГ, Т4 свободный — скрининг функции щитовидной железы.", price: 1200, durationMinutes: 15, category: "Анализы" },
  { name: "УЗИ брюшной полости", description: "Ультразвуковое исследование органов брюшной полости.", price: 2200, durationMinutes: 30, category: "Диагностика" },
  { name: "УЗИ почек и мочевого пузыря", description: "УЗИ почек, мочеточников и мочевого пузыря.", price: 1800, durationMinutes: 25, category: "Диагностика" },
  { name: "ЭКГ с расшифровкой", description: "Электрокардиография с заключением врача.", price: 900, durationMinutes: 20, category: "Диагностика" },
  { name: "Рентген грудной клетки", description: "Рентгенография органов грудной клетки в одной проекции.", price: 1500, durationMinutes: 15, category: "Диагностика" },
  { name: "Прививка от гриппа", description: "Вакцинация против гриппа, осмотр терапевта перед прививкой.", price: 1200, durationMinutes: 25, category: "Вакцинация" },
  { name: "Вакцинация от COVID-19", description: "Введение вакцины, наблюдение 30 минут после процедуры.", price: 0, durationMinutes: 45, category: "Вакцинация" },
  { name: "Капельница (витамины, детокс)", description: "Внутривенная инфузия по назначению врача, мониторинг.", price: 2500, durationMinutes: 45, category: "Процедуры" },
  { name: "Массаж спины (30 мин)", description: "Классический массаж шейно-воротниковой зоны и спины.", price: 2000, durationMinutes: 30, category: "Процедуры" },
];

export async function seed(): Promise<void> {
  if (newsDb.countNews() === 0) {
    NEWS.forEach((n) => newsDb.createNews(n));
    console.log("Seeded news");
  }

  if (servicesDb.countServices() === 0) {
    SERVICES.forEach((s) => servicesDb.createService(s));
    console.log("Seeded services");
  }

  const adminPolimedic = usersDb.findUserByEmail("admin@polimedicclinic.ru");
  const adminUpmarch = usersDb.findUserByEmail("admin@upmarch.ru");

  if (adminPolimedic) {
    // Админ с новым email уже есть — ничего не делаем
  } else if (adminUpmarch) {
    // Миграция: был админ на старом email — обновляем на новый
    usersDb.updateUserEmail(adminUpmarch._id, "admin@polimedicclinic.ru");
    console.log("Admin email updated to admin@polimedicclinic.ru (was admin@upmarch.ru)");
  } else if (usersDb.countUsersByRole("admin") === 0) {
    const passwordHash = await hashPassword("Admin123!");
    usersDb.createUser({
      email: "admin@polimedicclinic.ru",
      passwordHash,
      role: "admin",
      fullName: "Администратор Клиники",
    });
    console.log("Seeded admin user (admin@polimedicclinic.ru / Admin123!)");
  }

  if (usersDb.countUsersByRole("doctor") === 0) {
    if (!usersDb.findUserByEmail("therapist@clinic.ru")) {
      const doctor1Password = await hashPassword("Doctor123!");
      usersDb.createUser({
        email: "therapist@clinic.ru",
        passwordHash: doctor1Password,
        role: "doctor",
        fullName: "Ольга Сергеевна Морозова",
        phone: "+7 (495) 123-45-67",
      });
    }
    if (!usersDb.findUserByEmail("pediatrician@clinic.ru")) {
      const doctor2Password = await hashPassword("Doctor123!");
      usersDb.createUser({
        email: "pediatrician@clinic.ru",
        passwordHash: doctor2Password,
        role: "doctor",
        fullName: "Александр Иванович Петров",
        phone: "+7 (495) 123-45-68",
      });
    }
    if (!usersDb.findUserByEmail("cardiologist@clinic.ru")) {
      const doctor3Password = await hashPassword("Doctor123!");
      usersDb.createUser({
        email: "cardiologist@clinic.ru",
        passwordHash: doctor3Password,
        role: "doctor",
        fullName: "Елена Викторовна Сидорова",
        phone: "+7 (495) 123-45-69",
      });
    }
    if (!usersDb.findUserByEmail("neurologist@clinic.ru")) {
      const doctor4Password = await hashPassword("Doctor123!");
      usersDb.createUser({
        email: "neurologist@clinic.ru",
        passwordHash: doctor4Password,
        role: "doctor",
        fullName: "Иван Петрович Иванов",
        phone: "+7 (495) 123-45-70",
      });
    }
    if (!usersDb.findUserByEmail("dermatologist@clinic.ru")) {
      const doctor5Password = await hashPassword("Doctor123!");
      usersDb.createUser({
        email: "dermatologist@clinic.ru",
        passwordHash: doctor5Password,
        role: "doctor",
        fullName: "Мария Александровна Кузнецова",
        phone: "+7 (495) 123-45-71",
      });
    }
    if (!usersDb.findUserByEmail("gynecologist@clinic.ru")) {
      const doctor6Password = await hashPassword("Doctor123!");
      usersDb.createUser({
        email: "gynecologist@clinic.ru",
        passwordHash: doctor6Password,
        role: "doctor",
        fullName: "Анна Сергеевна Попова",
        phone: "+7 (495) 123-45-72",
      });
    }
    if (!usersDb.findUserByEmail("urologist@clinic.ru")) {
      const doctor7Password = await hashPassword("Doctor123!");
      usersDb.createUser({
        email: "urologist@clinic.ru",
        passwordHash: doctor7Password,
        role: "doctor",
        fullName: "Дмитрий Викторович Смирнов",
        phone: "+7 (495) 123-45-73",
      });
    }
    if (!usersDb.findUserByEmail("ophthalmologist@clinic.ru")) {
      const doctor8Password = await hashPassword("Doctor123!");
      usersDb.createUser({
        email: "ophthalmologist@clinic.ru",
        passwordHash: doctor8Password,
        role: "doctor",
        fullName: "Екатерина Ивановна Волкова",
        phone: "+7 (495) 123-45-74",
      });
    }
    if (!usersDb.findUserByEmail("endocrinologist@clinic.ru")) {
      const doctor9Password = await hashPassword("Doctor123!");
      usersDb.createUser({
        email: "endocrinologist@clinic.ru",
        passwordHash: doctor9Password,
        role: "doctor",
        fullName: "Сергей Александрович Новиков",
        phone: "+7 (495) 123-45-75",
      });
    }
    if (!usersDb.findUserByEmail("psychiatrist@clinic.ru")) {
      const doctor10Password = await hashPassword("Doctor123!");
      usersDb.createUser({
        email: "psychiatrist@clinic.ru",
        passwordHash: doctor10Password,
        role: "doctor",
        fullName: "Ольга Дмитриевна Фёдорова",
        phone: "+7 (495) 123-45-76",
      });
    }
    if (!usersDb.findUserByEmail("surgeon@clinic.ru")) {
      const doctor11Password = await hashPassword("Doctor123!");
      usersDb.createUser({
        email: "surgeon@clinic.ru",
        passwordHash: doctor11Password,
        role: "doctor",
        fullName: "Андрей Сергеевич Морозов",
        phone: "+7 (495) 123-45-77",
      });
    }
    if (!usersDb.findUserByEmail("otolaryngologist@clinic.ru")) {
      const doctor12Password = await hashPassword("Doctor123!");
      usersDb.createUser({
        email: "otolaryngologist@clinic.ru",
        passwordHash: doctor12Password,
        role: "doctor",
        fullName: "Татьяна Викторовна Лебедева",
        phone: "+7 (495) 123-45-78",
      });
    }
    console.log("Seeded doctor users");
  }
}
