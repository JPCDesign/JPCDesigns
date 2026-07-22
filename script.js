
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.nav-links');
if (menuButton && menu) {
  menuButton.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
}

const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
  const dateField = bookingForm.elements.date;
  const today = new Date();
  dateField.min = today.toISOString().split('T')[0];

  const params = new URLSearchParams(window.location.search);
  const requestedService = params.get('service');
  if (requestedService) bookingForm.elements.service.value = requestedService;

  dateField.addEventListener('change', () => {
    if (!dateField.value) return;
    const selected = new Date(dateField.value + 'T12:00:00');
    const day = selected.getDay();
    if (day === 0 || day === 6) {
      dateField.setCustomValidity('Please choose a Monday through Friday date.');
    } else {
      dateField.setCustomValidity('');
    }
  });

  bookingForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!bookingForm.reportValidity()) return;

    const data = new FormData(bookingForm);
    const selected = new Date(String(data.get('date')) + 'T12:00:00');
    if (selected.getDay() === 0 || selected.getDay() === 6) {
      bookingForm.querySelector('.form-status').textContent = 'Please choose a Monday through Friday date.';
      return;
    }

    const subject = `JPC Design booking request — ${data.get('service')}`;
    const body = [
      `Name: ${data.get('name')}`,
      `Email: ${data.get('email')}`,
      `Phone: ${data.get('phone')}`,
      `Service: ${data.get('service')}`,
      `Preferred date: ${data.get('date')}`,
      `Preferred time: ${data.get('time')}`,
      `Property city/address: ${data.get('location') || 'Not provided'}`,
      '',
      'Project details:',
      data.get('message'),
      '',
      'Please confirm whether this appointment time is available.'
    ].join('\n');

    bookingForm.querySelector('.form-status').textContent = 'Opening your email application with the booking request…';
    window.location.href = `mailto:jpcdesign1996@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
