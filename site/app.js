const views = {
  lookup: document.querySelector("#lookupView"),
  box: document.querySelector("#boxView"),
  result: document.querySelector("#resultView"),
};

const form = document.querySelector("#lookupForm");
const nameInput = document.querySelector("#memberName");
const message = document.querySelector("#formMessage");
const mysteryBox = document.querySelector("#mysteryBox");
const boxOwner = document.querySelector("#boxOwner");
const boxTitle = document.querySelector("#boxTitle");
const tapHint = document.querySelector("#tapHint");
const resultGroup = document.querySelector("#resultGroup");
const backButton = document.querySelector("#backButton");
const headerSpacer = document.querySelector("#headerSpacer");

let memberMap = new Map();
let selected = null;
let opening = false;
let timer = null;

const normalizeName = (value) => value.normalize("NFC").replace(/\s+/g, "").toLocaleLowerCase("ko-KR");

function showView(name) {
  Object.entries(views).forEach(([key, element]) => element.classList.toggle("hidden", key !== name));
  const canGoBack = name !== "lookup";
  backButton.classList.toggle("hidden", !canGoBack);
  headerSpacer.classList.toggle("hidden", canGoBack);
}

function reset() {
  if (timer) clearTimeout(timer);
  selected = null;
  opening = false;
  nameInput.value = "";
  message.textContent = "";
  mysteryBox.classList.remove("is-opening");
  mysteryBox.disabled = false;
  boxTitle.textContent = "박스를 눌러 열어보세요";
  tapHint.textContent = "Tap to open";
  showView("lookup");
  nameInput.focus();
}

async function loadMembers() {
  try {
    const response = await fetch("./members.csv", { cache: "no-store" });
    if (!response.ok) throw new Error();
    const text = await response.text();
    const rows = text.trim().split(/\r?\n/).slice(1);
    memberMap = new Map(rows.map((row) => {
      const [name, group] = row.split(",").map((cell) => cell.trim());
      return [normalizeName(name), { name, group }];
    }));
  } catch {
    message.textContent = "명단을 불러오지 못했습니다. 화면을 새로고침해 주세요.";
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const key = normalizeName(nameInput.value);
  if (!key) return void (message.textContent = "이름을 입력해 주세요.");
  selected = memberMap.get(key);
  if (!selected) return void (message.textContent = "명단에서 이름을 찾지 못했어요. 이름을 다시 확인해 주세요.");
  message.textContent = "";
  boxOwner.textContent = `${selected.name} 님의 랜덤박스`;
  showView("box");
});

nameInput.addEventListener("input", () => { message.textContent = ""; });

mysteryBox.addEventListener("click", () => {
  if (!selected || opening) return;
  opening = true;
  mysteryBox.disabled = true;
  mysteryBox.classList.add("is-opening");
  boxTitle.textContent = "두근두근…";
  tapHint.textContent = "조를 확인하고 있어요";
  navigator.vibrate?.([45, 35, 90]);
  timer = setTimeout(() => {
    resultGroup.textContent = `${selected.group}조`;
    showView("result");
  }, 1450);
});

backButton.addEventListener("click", () => { if (!opening) reset(); });
document.querySelector("#resetButton").addEventListener("click", reset);
document.querySelector("#againButton").addEventListener("click", reset);

const sparks = document.querySelector("#sparks");
for (let index = 0; index < 18; index += 1) {
  const spark = document.createElement("i");
  spark.className = "spark";
  spark.style.setProperty("--i", index);
  sparks.appendChild(spark);
}

const confetti = document.querySelector("#confetti");
for (let index = 0; index < 24; index += 1) {
  const piece = document.createElement("i");
  piece.style.setProperty("--i", index);
  confetti.appendChild(piece);
}

loadMembers();
