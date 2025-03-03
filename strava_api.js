// Gets the value for an element by its id and converts it to a string
function getDetails(detail) {
  const clientdetail = document.getElementById(detail).value;
  return String(clientdetail);
}

//Changes the users access to read all using client id
function setReadAll() {
  (clientidurl = getDetails("clientid")),
    (readall_url = `http://www.strava.com/oauth/authorize?client_id=${clientidurl}&response_type=code&redirect_uri=http://localhost/exchange_token&approval_prompt=force&scope=activity:read_all`);
  window.open(readall_url);
  document.getElementById("stageone").style.display = "none";
  document.getElementById("stagetwo").style.display = "block";
}

const authlink = "https://www.strava.com/oauth/token?";

let activitiesData = [];

//Runs last and gets the activities
function getActivities(res) {
  const activities_link = `https://www.strava.com/api/v3/athlete/activities?per_page=200&access_token=${res.access_token}`;
  fetch(activities_link)
    .then((res) => res.json())
    .then((data) => parseActivities(data));
}

//Authorises the user based off their details provided, uses the Medium method where authorization code used
function reAuthorise() {
  const userclientid = clientidurl;
  console.log(userclientid);
  const userclientsecret = getDetails("clientsecret");
  console.log(userclientsecret);
  const usercode = getDetails("code");
  console.log(usercode);
  fetch(authlink, {
    method: "post",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: userclientid,
      client_secret: userclientsecret,
      code: usercode,
      grant_type: "authorization_code",
    }),
  })
    .then((res) => res.json())
    .then((res) => getActivities(res));
}

// Thanks to mgd722 for the github function to decrypt polylines, converted to JS
function decodePolyline(polylineStr) {
  let index = 0,
    lat = 0,
    lng = 0;
  const coordinates = [];
  const changes = { latitude: 0, longitude: 0 };

  while (index < polylineStr.length) {
    for (const unit of ["latitude", "longitude"]) {
      let shift = 0,
        result = 0;

      while (true) {
        const byte = polylineStr.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
        if (byte < 0x20) break;
      }

      changes[unit] = result & 1 ? ~(result >> 1) : result >> 1;
    }

    lat += changes.latitude;
    lng += changes.longitude;

    coordinates.push([lng / 1e5, lat / 1e5]);
  }

  return coordinates;
}

function parseActivities(data) {
  routes = [];
  for (const item of data) {
    polyline = item["map"]["summary_polyline"];
    decoded_line = decodePolyline(polyline);
    routes.push(decoded_line);
    localStorage.setItem("scratchmap_routes", JSON.stringify(routes));
  }
  console.log(routes);
}

console.log(activitiesData);
