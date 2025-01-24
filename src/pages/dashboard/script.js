const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
  alert('You must log in to access this page');
  window.location.href = '/';
}

async function fetchContent() {
  const response = await fetch('/.netlify/functions/get-content');
  const data = await response.json();
  displayContent(data);
}

function displayContent(content) {
  const contentList = document.getElementById('content-list');
  content.items.forEach(item => {
    contentList.innerHTML += `<p>${item.fields.title}</p>`;
  });
}

fetchContent();

async function updateContent(entryId, newTitle) {
    const response = await fetch('/.netlify/functions/update-content', {
      method: 'POST',
      body: JSON.stringify({ id: entryId, title: newTitle }),
    });
    const result = await response.json();
    alert(result.message);
    fetchContent();
  }

  document.getElementById('edit-form').onsubmit = function(event) {
    event.preventDefault();
    const id = document.getElementById('entry-id').value;
    const title = document.getElementById('entry-title').value;
    updateContent(id, title);
};