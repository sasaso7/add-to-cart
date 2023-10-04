import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
  update
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
const appSettings = {
  apiKey: "AIzaSyAd9jeS2_OF-bxn8nTpIdJpMlvbKftt-jg",
  databaseURL:
    "https://scrimba-first-default-rtdb.europe-west1.firebasedatabase.app/",
};

const app = initializeApp(appSettings);

//Making the authorization here
const auth = getAuth(app);


let userID = "";
let isSignedIn = false;
let userEmail = "";

const database = getDatabase(app);
const sharedList = ref(database, "sharedWith")

//Helper functions
function replacePeriodWithZero(inputString) {
    return inputString.replace(/\./g, '>');
}

function replaceZeroWithPeriod(inputString) {
    return inputString.replace(/>/g, '.');
}

//Methods for auth
onAuthStateChanged(auth, (user) => {
  const mainContainer = document.getElementById("main-container");
  if (user) {
    isSignedIn = true;
    userID = user.uid;
    userEmail = user.email;
    mainContainer.innerHTML =
      '<button class="absolute-buttons" id="share"><img src="assets/plus.png" class="button-image"></button><button id="logout" class="absolute-buttons"><img src="assets/logout.png" class="button-image"></button><img src="assets/cat.png"><input type="text" id="input-field" placeholder="Chocolate"><button id="add-button">Add to cart</button><ul id="shopping-list"></ul>';
    loggedInEventListeners(user.email);
  } else {
  }
});

const loginButton = document.getElementById("login-button");

loginButton.addEventListener("click", () => {
  const emailValue = document.getElementById("input-email").value;
  const passwordValue = document.getElementById("input-password").value;
  signInWithEmailAndPassword(auth, emailValue, passwordValue).then((data) => {
    userEmail = emailValue;
  });
});


//Methods for sharing
function addNewShareMember(inputValue, currentUser) {
    const sharedListEmail = ref(database, `sharedWith/${replacePeriodWithZero(currentUser)}`);
    push(sharedListEmail, replacePeriodWithZero(inputValue));
}

//Methods used in user experience

function loggedInEventListeners(email) {
    const shoppingListInDBUser = ref(database, `shoppingList/${replacePeriodWithZero(email)}`);
    const shoppingListInDB = ref(database, `shoppingList`);

  const addButtonEl = document.getElementById("add-button");
  const logoutButtonEl = document.getElementById("logout");
const shareWithButtonEl = document.getElementById("share");

  addButtonEl.addEventListener("click", function () {
    const inputFieldEl = document.getElementById("input-field");
    let inputValue = inputFieldEl.value;
    push(shoppingListInDBUser, inputValue);

    clearInputFieldEl();
  });

  shareWithButtonEl.addEventListener("click", () => {
    const mainDiv = document.getElementById("main-container")
    const shareDiv = document.createElement("div");
    shareDiv.id = "share-div";
    shareDiv.innerHTML = "<button id=\"close-share\"><img class=\"button-image\" src=\"assets/close.png\"></button><input id=\"mail-input-share\" placeholder=\"E-mail\"><button id=\"share-button\">Share</button>";

    mainDiv.append(shareDiv)

    const closeButton = document.getElementById("close-share");
    const shareButton = document.getElementById("share-button");


    const sharedListEmail = ref(database, `sharedWith/${replacePeriodWithZero(userEmail)}`);
    const list = document.createElement("ul");
    list.id = "shared-list"

    onValue(sharedListEmail, (snapshot) => {
        if(snapshot.exists()){
            const listOfShared = Object.entries(snapshot.val());
            list.innerHTML = "";
            listOfShared.forEach((entry) => {
                let exactLocationOfItemInDB = ref(database, `sharedWith/${replacePeriodWithZero(userEmail)}/${entry[0]}`);

                const entryElement = document.createElement("li");
                const entryFormatted = replaceZeroWithPeriod(entry[1]);
                console.log(entryFormatted);
                entryElement.innerHTML = `<div>${entryFormatted}</div>`;
                entryElement.addEventListener("click", () => {
                    remove(exactLocationOfItemInDB);
                })


                list.append(entryElement);
            })
            shareDiv.append(list);
        }
    })

    closeButton.addEventListener("click", () => {
        shareDiv.remove();
        shareButton.removeEventListener();
    })

    shareButton.addEventListener("click", () => {
        const emailInput = document.getElementById("mail-input-share")
        addNewShareMember(emailInput.value, email);
        emailInput.value = "";
    })
  })

  logoutButtonEl.addEventListener("click", () => {
    signOut(auth);
    document.location.reload();
  });

// onValue(sharedList, (snapshot) => {
//     if(snapshot.exists()) {
//         const sharedListEmail = ref(database, `sharedWith/${replacePeriodWithZero(userEmail)}`);
//         onValue(sharedListEmail, (snapshot2) => {
//             if(snapshot2.exists()){
//                 const userArray = Object.values(snapshot2.val());
//                 userArray.forEach((user) => {
//                     const shoppingListInDBPersonified = ref(database, `shoppingList/${replacePeriodWithZero(user)}`)
//                     onValue(shoppingListInDB, function (snapshot) {
//                         if (snapshot.exists()) {
//                           let itemsArray = Object.entries(snapshot.val());
                    
//                           clearShoppingListEl();
                    
//                           for (let i = 0; i < itemsArray.length; i++) {
//                             let currentItem = itemsArray[i];
//                             let currentItemID = currentItem[0];
//                             let currentItemValue = currentItem[1];
                    
//                             appendItemToShoppingListEl(currentItem);
//                           }
//                         } else {
//                           const shoppingListEl = document.getElementById("shopping-list");
//                           shoppingListEl.innerHTML = "No items to shop...";
//                         }
//                     });
//                 })
//             }
//         })
//     }
// })

onValue(shoppingListInDB, function (snapshot) {
    if (snapshot.exists()) {
        const sharedListEmail = ref(database, `sharedWith/${replacePeriodWithZero(userEmail)}`);
        onValue(sharedListEmail, (snapshot2) => {
            clearShoppingListEl();
            if(snapshot2.exists()){
                const userArray = Object.values(snapshot2.val());
                userArray.push(replacePeriodWithZero(userEmail));
                userArray.forEach((user) => {
                    const shoppingListInDBPersonified = ref(database, `shoppingList/${replacePeriodWithZero(user)}`)
                    onValue(shoppingListInDBPersonified, function (snapshot) {
                        if (snapshot.exists()) {
                          let itemsArray = Object.entries(snapshot.val());
                    
                          for (let i = 0; i < itemsArray.length; i++) {
                            let currentItem = itemsArray[i];
                            let currentItemID = currentItem[0];
                            let currentItemValue = currentItem[1];
                    
                            appendItemToShoppingListEl(currentItem, `shoppingList/${user}`);
                          }
                        }
                    });
                })
            }
        })
    } else {
      const shoppingListEl = document.getElementById("shopping-list");
      shoppingListEl.innerHTML = "No items to shop...";
    }
});
}

function clearShoppingListEl() {
  const shoppingListEl = document.getElementById("shopping-list");
  shoppingListEl.innerHTML = "";
}

function clearInputFieldEl() {
  const inputFieldEl = document.getElementById("input-field");
  inputFieldEl.value = "";
}

function appendItemToShoppingListEl(item, location) {
  let itemID = item[0];
  let itemValue = item[1];

  let newEl = document.createElement("li");

  newEl.textContent = itemValue;

  newEl.addEventListener("click", function () {
    let exactLocationOfItemInDB = ref(database, `${location}/${itemID}`);

    remove(exactLocationOfItemInDB);
  });
  const shoppingListEl = document.getElementById("shopping-list");
  shoppingListEl.append(newEl);
}
