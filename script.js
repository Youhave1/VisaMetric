window.onload = () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('welcomeMessage').innerText = Welcome, ${user.email};

  const links = user.links;
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    const page = link.getAttribute('data-page');
    if (links[page]) {
      link.setAttribute('href', links[page]);
    }
  });

  document.getElementById('logoutButton').addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = 'login.html';
  });
};
