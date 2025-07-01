

document.addEventListener('DOMContentLoaded', function () {
  const alerts = document.querySelectorAll('.alert');

  alerts.forEach(alert => {
    setTimeout(() => {
      alert.classList.add('fade');
      alert.classList.remove('show');

      setTimeout(() => {
        alert.remove();
      }, 500); 
    }, 4000);
  });
});
