window.onload = function() {
  const user = JSON.parse(localStorage.getItem('user')); // Check if user is logged in
  console.log(user);

  if (!user) {
    console.log(user);
    window.location.href = '/src/auth/login/index.html';
  } 
};