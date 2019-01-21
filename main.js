const installedAppIds = new Set();
const allApps = [];
const currentSelection = {
  viewName: "InstalledApps", // InstalledApps | GetApps | AppsDetail
  category: null,
  appId: null
};
// Dom references For Sections
const installedApp = document.getElementById("installedApps");
const nonInstalledViews = document.getElementById("nonInstalledViews");
const getApps = document.getElementById("getApps");
const appsDetails = document.getElementById("appsDetails");

// Dom References For Get Apps
const appsCategory = document.getElementById("appsCategory");
const getAppsHeading = document.getElementById("getAppsHeading");
const getAppsList = document.getElementById("getAppsList");

// Dom references For App Details
const appImage = document.getElementById("appImage");
const appName = document.getElementById("appName");
const appDescription = document.getElementById("appDescription");

const tabInstalledApp = document.getElementById("tabInstalledApp");
const tabGetApps = document.getElementById("tabGetApps");

function renderInstalledApps() {
  const apps = allApps.filter(u => installedAppIds.has(u.id));
  console.log("installed apps", apps);
  if (apps.length) {
    installedApp.innerHTML =
      apps.reduce(
        (htmlStr, app) => `${htmlStr}
    <li class="app-item-installed">
      <img src="${app.imageUrl}">
      <div class="width-1-1">
        <h4>${app.name}</h4>
        <p>${app.description}</p>
      </div>
      <button class="tab" onclick="uninstall(${app.id})">Dismiss</button>
    </li>
    `,
        "<ul>"
      ) + "</ul>";
  } else {
    installedApp.innerHTML = "No Apps Installed";
  }
}

function renderGetApps() {
  const categories = [...new Set(allApps.map(u => u.category))].sort();
  appsCategory.innerHTML = categories.reduce(
    (htmlStr, category) => ` ${htmlStr}
  <button class="tab ${
    category === currentSelection.category ? "active" : ""
  }" onclick="setView('GetApps', '${category}')">${category}</button>
  `,
    `<button class="tab ${
      currentSelection.category === null ? "active" : ""
    }" onclick="setView('GetApps', null)">All Apps</button>`
  );
  getAppsHeading.innerText = currentSelection.category || "All Apps";
  const apps = allApps.filter(
    u =>
      !installedAppIds.has(u.id) &&
      (currentSelection.category === null ||
        u.category === currentSelection.category)
  );
  if (apps.length) {
    getAppsList.innerHTML =
      apps.reduce(
        (htmlStr, app) => `${htmlStr}
    <li class="app-item-get-apps" onclick="setView('AppsDetail', ${app.id})">
      <img src="${app.imageUrl}">
      <h4>${app.name}</h4>
    </li>
    `,
        `<ul class="apps-item-get-apps">`
      ) + "</ul>";
  } else {
    getAppsList.innerHTML = "All apps are installed under this category";
  }
}

function renderAppDetails() {
  const app = allApps.find(u => u.id === currentSelection.appId);
  if (!app) {
  }
  appImage.setAttribute("src", app.imageUrl);
  appName.innerText = app.name;
  appDescription.innerText = app.description;
}

function setView(viewName, viewData) {
  currentSelection.viewName = viewName;

  nonInstalledViews.style.display = "none";
  getApps.style.display = "none";
  appsDetails.style.display = "none";

  tabInstalledApp.className = "tab";
  tabGetApps.className = "tab";

  switch (viewName) {
    case "InstalledApps":
      // installedApp.style.display = "block";
      tabInstalledApp.className = "tab active";
      renderInstalledApps();
      break;
    case "GetApps":
      if (viewData !== undefined) {
        currentSelection.category = viewData;
      }
      nonInstalledViews.style.display = "block";
      getApps.style.display = "flex";
      tabGetApps.className = "tab active";
      renderGetApps();
      break;
    case "AppsDetail":
      nonInstalledViews.style.display = "block";
      currentSelection.appId = viewData;
      appsDetails.style.display = "flex";
      renderAppDetails();
      break;
  }
  console.log("setting the view", viewName);
}

function back() {
  switch (currentSelection.viewName) {
    case "GetApps":
      setView("InstalledApps");
      break;
    case "AppsDetail":
      setView("GetApps", currentSelection.category);
      break;
    default:
      break;
  }
}

function install() {
  installedAppIds.add(currentSelection.appId);
  if (localStorage) {
    localStorage.setItem(
      "installedAppIds",
      JSON.stringify([...installedAppIds])
    );
  }
  setView("InstalledApps");
}
function uninstall(appId) {
  installedAppIds.delete(appId);
  renderInstalledApps();
}

function init() {
  if (localStorage) {
    try {
      const appsDataStr = localStorage.getItem("appsData");
      if (appsDataStr) {
        const appsData = JSON.parse(appsDataStr);
        allApps.length = 0;
        allApps.push(...appsData);
        const installedAppIdsLocal = JSON.parse(
          localStorage.getItem("installedAppIds")
        );
        installedAppIdsLocal.forEach(id => {
          installedAppIds.add(id);
        });
        setView("InstalledApps");
        return;
      }
    } catch (e) {}
  }
  fetch("https://api.jsonbin.io/b/5bee9acc3c134f38b019e808/1")
    .then(res => res.json())
    .then(res => {
      allApps.length = 0;
      allApps.push(...res.data);
      if (localStorage) {
        localStorage.setItem("appsData", JSON.stringify(allApps));
      }
      setView("InstalledApps");
      console.log(allApps);
    });
}
init();
