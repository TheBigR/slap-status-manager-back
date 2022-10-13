import fetch from "node-fetch";


const firebaseUrl =
  "https://react-getting-started-13142-default-rtdb.firebaseio.com/royke.json";

export async function getLatest() {
  const fireRes = await fetch(`${firebaseUrl}?orderBy="Key"&limitToLast=1`);
  const resJson = await fireRes.json();
  if (resJson !== null) {
    return Object.values(resJson)[0];
  }
  return {};
}

export async function updateStatus(update) {
  const prevStatus = await getLatest();
  if (!prevStatus[update.name]) {
    prevStatus[update.name] = {
      status: update.status,
      uuid: update.uuid,
    };
  } else {
    prevStatus[update.name].status = update.status;
  }
  const resp = await fetch(firebaseUrl, {
    method: "POST",
    body: JSON.stringify(prevStatus),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const currStatus = await getLatest();
  return currStatus;
}
