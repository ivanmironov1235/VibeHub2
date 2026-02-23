// Регистрация
const registerForm = document.getElementById("registerForm");
const messageDiv = document.getElementById("message");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(registerForm);
  try {
    const res = await fetch("/register", { method: "POST", body: formData });
    const data = await res.json();
    if(data.success){
      messageDiv.innerHTML = "<span style='color:lightgreen'>Регистрация успешна!</span>";
      registerForm.reset();
    } else {
      messageDiv.innerHTML = "<span style='color:red'>Ошибка: "+(data.error||"Unknown")+"</span>";
    }
  } catch(err) {
    console.error(err);
    messageDiv.innerHTML = "<span style='color:red'>Ошибка при регистрации</span>";
  }
});

// Публикация постов
const postForm = document.getElementById("postForm");
const postsContainer = document.getElementById("postsContainer");

postForm.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const formData = new FormData(postForm);
  try{
    const res = await fetch("/post", { method:"POST", body:formData });
    const data = await res.json();
    if(data.success){
      postForm.reset();
      loadPosts();
    }
  }catch(err){console.error(err);}
});

async function loadPosts(){
  try{
    const res = await fetch("/posts");
    const posts = await res.json();
    postsContainer.innerHTML = "";
    posts.forEach(p=>{
      const div = document.createElement("div");
      div.classList.add("post");
      div.innerHTML = <strong>${p.user}</strong><p>${p.content}</p>${p.img?`<img src="${p.img}" style="max-width:100%">:""}`;
      postsContainer.appendChild(div);
    });
  }catch(err){console.error(err);}
}

loadPosts();

// Чат
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");

chatForm.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const msgInput = chatForm.querySelector("input[name=msg]");
  const msg = msgInput.value;
  try{
    await fetch("/chat", {
      method:"POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({from:"user1", to:"user2", msg})
    });
    msgInput.value="";
    loadChat("user1","user2");
  }catch(err){console.error(err);}
});

async function loadChat(u1,u2){
  try{
    const res = await fetch(`/chat/${u1}/${u2}`);
    const messages = await res.json();
    chatWindow.innerHTML = "";
    messages.forEach(m=>{
      const div = document.createElement("div");
      div.classList.add("message");
      div.textContent = ${m.user}: ${m.msg};
      chatWindow.appendChild(div);
    });
  }catch(err){console.error(err);}
}

loadChat("user1","user2");
