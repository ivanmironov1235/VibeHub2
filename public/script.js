let currentUser = null;

const API = "";

document.getElementById("register-btn").onclick = async () => {
  const username = document.getElementById("username").value;
  const avatarFile = document.getElementById("avatar").files[0];
  const formData = new FormData();
  formData.append("username", username);
  if (avatarFile) formData.append("avatar", avatarFile);

  const res = await fetch(API + "/register", { method: "POST", body: formData });
  const data = await res.json();
  if (data.success) {
    currentUser = username;
    document.getElementById("register-section").style.display = "none";
    document.getElementById("main-section").style.display = "block";
    document.getElementById("user-name").innerText = currentUser;
    loadFriends();
    loadPosts();
  } else {
    alert(data.error);
  }
};

async function loadFriends() {
  const res = await fetch(API + "/users");
  const users = await res.json();
  const friendsList = document.getElementById("friends-list");
  const requestsList = document.getElementById("requests-list");
  friendsList.innerHTML = "";
  requestsList.innerHTML = "";
  const myData = users[currentUser];
  if (!myData) return;

  myData.friends.forEach(f => {
    const li = document.createElement("li");
    li.innerText = f;
    friendsList.appendChild(li);
  });

  myData.requests.forEach(r => {
    const li = document.createElement("li");
    li.innerText = r;
    const btn = document.createElement("button");
    btn.innerText = "Принять";
    btn.onclick = async () => {
      await fetch(API + "/friend-accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: currentUser, friend: r })
      });
      loadFriends();
    };
    li.appendChild(btn);
    requestsList.appendChild(li);
  });
}

document.getElementById("add-friend-btn").onclick = async () => {
  const to = document.getElementById("friend-name").value;
  await fetch(API + "/friend-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from: currentUser, to })
  });
  document.getElementById("friend-name").value = "";
  alert("Запрос отправлен!");
};

document.getElementById("post-btn").onclick = async () => {
  const content = document.getElementById("post-content").value;
  const imgFile = document.getElementById("post-img").files[0];
  const formData = new FormData();
  formData.append("user", currentUser);
  formData.append("avatar", "");
  formData.append("content", content);
  if (imgFile) formData.append("img", imgFile);

  await fetch(API + "/post", { method: "POST", body: formData });
  document.getElementById("post-content").value = "";
  document.getElementById("post-img").value = "";
  loadPosts();
};

async function loadPosts() {
  const res = await fetch(API + "/posts");
  const posts = await res.json();
  const postsList = document.getElementById("posts-list");
  postsList.innerHTML = "";
  posts.forEach(p => {
    const div = document.createElement("div");
    div.innerHTML = <strong>${p.user}</strong>: ${p.content} ${p.img ? `<br><img src="${p.img}" style="max-width:100px;"> : ""}`;
    postsList.appendChild(div);
  });
}

// Простейший чат
document.getElementById("send-chat-btn").onclick = async () => {
  const to = document.getElementById("chat-friend-name").value;
  const msg = document.getElementById("chat-msg").value;
  await fetch(API + "/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from: currentUser, to, msg })
  });
  document.getElementById("chat-msg").value = "";
  loadChat(to);
};

async function loadChat(friend) {
  const res = await fetch(API + `/chat/${currentUser}/${friend}`);
  const msgs = await res.json();
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = "";
  msgs.forEach(m => {
    const div = document.createElement("div");
    div.innerText = ${m.user}: ${m.msg};
    chatBox.appendChild(div);
  });
}