// ==========================================
// GEO SERVICE
// SmartRide AI - Dynamic Location & Route Service
// ==========================================


// ==========================================
// 1. CALCULATE DISTANCE
// ==========================================

export function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat =
    ((Number(lat2) - Number(lat1)) * Math.PI) / 180;

  const dLon =
    ((Number(lon2) - Number(lon1)) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((Number(lat1) * Math.PI) / 180) *
      Math.cos((Number(lat2) * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return Number((R * c).toFixed(2));
}


// ==========================================
// 2. CALCULATE TRAVEL TIME
// ==========================================

export function calculateTravelTime(distanceKm) {
  if (!distanceKm || Number(distanceKm) <= 0) {
    return "0 min";
  }

  const averageSpeed = 25;

  const timeInHours =
    Number(distanceKm) / averageSpeed;

  const timeInMinutes =
    Math.round(timeInHours * 60);

  return `${Math.max(1, timeInMinutes)} min`;
}


// ==========================================
// 3. CREATE NOMINATIM URL
// ==========================================

function createSearchUrl(query, indiaOnly = true) {
  let url =
    "https://nominatim.openstreetmap.org/search" +
    "?format=json" +
    "&q=" +
    encodeURIComponent(query) +
    "&limit=10" +
    "&addressdetails=1" +
    "&dedupe=1";

  if (indiaOnly) {
    url += "&countrycodes=in";
  }

  return url;
}


// ==========================================
// 4. NORMALIZE TEXT
// ==========================================

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[,\-]/g, " ")
    .replace(/\s+/g, " ");
}


// ==========================================
// 5. GET CITY FROM RESULT
// ==========================================

function getResultCity(result) {
  const address = result?.address || {};

  return (
    address.city ||
    address.town ||
    address.municipality ||
    address.village ||
    address.city_district ||
    address.county ||
    ""
  );
}


// ==========================================
// 6. GET LOCATION TEXT
// ==========================================

function getLocationText(result) {
  const address = result?.address || {};

  return normalizeText(
    [
      result?.name,
      address.road,
      address.suburb,
      address.neighbourhood,
      address.quarter,
      getResultCity(result),
      address.state,
      address.country,
    ]
      .filter(Boolean)
      .join(" ")
  );
}


// ==========================================
// 7. SCORE RESULT
// ==========================================

function scoreResult(
  result,
  searchText,
  context = null
) {
  let score = 0;

  const input = normalizeText(searchText);

  const displayName =
    normalizeText(result.display_name);

  const name =
    normalizeText(result.name);

  const address =
    result.address || {};

  const road =
    normalizeText(address.road);

  const suburb =
    normalizeText(address.suburb);

  const neighbourhood =
    normalizeText(address.neighbourhood);

  const quarter =
    normalizeText(address.quarter);

  const city =
    normalizeText(getResultCity(result));

  const state =
    normalizeText(address.state);

  const country =
    normalizeText(address.country);

  const type =
    normalizeText(result.type);

  const category =
    normalizeText(result.category);


  // ==========================================
  // COUNTRY CHECK
  // ==========================================

  if (country === "india") {
    score += 50;
  } else if (country) {
    score -= 200;
  }


  // ==========================================
  // EXACT MATCH
  // ==========================================

  if (name === input) {
    score += 200;
  }

  if (road === input) {
    score += 180;
  }

  if (suburb === input) {
    score += 180;
  }

  if (neighbourhood === input) {
    score += 180;
  }

  if (quarter === input) {
    score += 170;
  }

  if (city === input) {
    score += 170;
  }


  // ==========================================
  // PARTIAL MATCH
  // ==========================================

  if (name && input.includes(name)) {
    score += 100;
  }

  if (name && name.includes(input)) {
    score += 100;
  }

  if (road && road.includes(input)) {
    score += 90;
  }

  if (suburb && suburb.includes(input)) {
    score += 90;
  }

  if (
    neighbourhood &&
    neighbourhood.includes(input)
  ) {
    score += 90;
  }

  if (
    quarter &&
    quarter.includes(input)
  ) {
    score += 80;
  }


  // ==========================================
  // DISPLAY NAME MATCH
  // ==========================================

  if (displayName.includes(input)) {
    score += 60;
  }


  // ==========================================
  // CONTEXT MATCH
  // ==========================================

  if (context) {
    const contextCity =
      normalizeText(context.city);

    const contextState =
      normalizeText(context.state);

    const contextCountry =
      normalizeText(context.country);


    // ----------------------------------------
    // SAME CITY
    // ----------------------------------------

    if (
      contextCity &&
      city &&
      city === contextCity
    ) {
      score += 300;

      console.log(
        "✅ Same city:",
        contextCity
      );
    }


    // ----------------------------------------
    // CITY APPEARS IN DISPLAY NAME
    // ----------------------------------------

    if (
      contextCity &&
      displayName.includes(contextCity)
    ) {
      score += 150;
    }


    // ----------------------------------------
    // SAME STATE
    // ----------------------------------------

    if (
      contextState &&
      state &&
      state === contextState
    ) {
      score += 120;
    }


    // ----------------------------------------
    // SAME COUNTRY
    // ----------------------------------------

    if (
      contextCountry &&
      country &&
      country === contextCountry
    ) {
      score += 50;
    }
  }


  // ==========================================
  // LOCATION TYPE
  // ==========================================

  if (
    type === "suburb" ||
    type === "neighbourhood" ||
    type === "quarter"
  ) {
    score += 40;
  }

  if (
    type === "road" ||
    type === "street"
  ) {
    score += 35;
  }

  if (
    type === "city" ||
    type === "town" ||
    type === "village"
  ) {
    score += 30;
  }

  if (category === "place") {
    score += 20;
  }


  // ==========================================
  // INPUT NOT FOUND IN RESULT
  // ==========================================

  const combinedText =
    getLocationText(result);

  if (
    input &&
    !combinedText.includes(input)
  ) {
    score -= 120;
  }


  return score;
}


// ==========================================
// 8. SELECT BEST RESULT
// ==========================================

function selectBestResult(
  results,
  searchText,
  context = null
) {
  if (
    !results ||
    results.length === 0
  ) {
    return null;
  }


  const scoredResults =
    results.map((result) => ({
      result,
      score: scoreResult(
        result,
        searchText,
        context
      ),
    }));


  scoredResults.sort(
    (a, b) => b.score - a.score
  );


  console.log(
    "================================"
  );

  console.log(
    "📍 LOCATION SEARCH RESULTS"
  );

  scoredResults.forEach(
    (item, index) => {
      console.log(
        `${index + 1}. Score: ${item.score}`,
        item.result.display_name
      );
    }
  );

  console.log(
    "================================"
  );


  return scoredResults[0].result;
}


// ==========================================
// 9. CONVERT RESULT
// ==========================================

function convertResultToLocationData(
  result,
  fallbackName
) {
  if (!result) {
    return null;
  }

  const address =
    result.address || {};

  const city =
    getResultCity(result);

  return {
    lat: Number(result.lat),

    lon: Number(result.lon),

    displayName:
      result.display_name ||
      fallbackName,

    name:
      result.name ||
      fallbackName,

    city: city,

    state:
      address.state || "",

    country:
      address.country || "",

    postcode:
      address.postcode || "",

    type:
      result.type || "",

    category:
      result.category || "",
  };
}


// ==========================================
// 10. FETCH NOMINATIM
// ==========================================

async function fetchNominatim(
  query
) {
  const url =
    createSearchUrl(
      query,
      true
    );

  console.log(
    "🔎 Searching:",
    query
  );

  console.log(
    "🔗 URL:",
    url
  );

  const response =
    await fetch(
      url,
      {
        headers: {
          Accept:
            "application/json",
        },
      }
    );

  if (!response.ok) {
    throw new Error(
      `Geocoding failed: ${response.status}`
    );
  }

  return await response.json();
}


// ==========================================
// 11. GEOCODE LOCATION
// ==========================================

export async function geocodeLocation(
  location,
  context = null
) {
  try {
    if (
      !location ||
      !location.trim()
    ) {
      console.error(
        "❌ Location is empty"
      );

      return null;
    }


    const searchText =
      location.trim();


    console.log(
      "================================"
    );

    console.log(
      "📍 Searching Location:",
      searchText
    );


    // ========================================
    // STEP 1
    // CONTEXT SEARCH
    // ========================================

    if (
      context &&
      context.city
    ) {
      const contextParts = [
        searchText,
        context.city,
        context.state,
        context.country || "India",
      ].filter(Boolean);

      const contextQuery =
        contextParts.join(", ");

      console.log(
        "📍 Context Search:",
        contextQuery
      );


      const contextData =
        await fetchNominatim(
          contextQuery
        );


      if (
        contextData &&
        contextData.length > 0
      ) {
        const contextResult =
          selectBestResult(
            contextData,
            searchText,
            context
          );


        if (contextResult) {
          const locationData =
            convertResultToLocationData(
              contextResult,
              searchText
            );


          console.log(
            "✅ Context Location Found:",
            locationData
          );


          return locationData;
        }
      }
    }


    // ========================================
    // STEP 2
    // NORMAL SEARCH
    // ========================================

    const data =
      await fetchNominatim(
        `${searchText}, India`
      );


    console.log(
      "📍 General Search Results:",
      data
    );


    if (
      !data ||
      data.length === 0
    ) {
      console.error(
        "❌ Location not found:",
        searchText
      );

      return null;
    }


    // ========================================
    // STEP 3
    // SELECT BEST
    // ========================================

    const result =
      selectBestResult(
        data,
        searchText,
        context
      );


    if (!result) {
      return null;
    }


    const locationData =
      convertResultToLocationData(
        result,
        searchText
      );


    console.log(
      "✅ Location Found:",
      locationData
    );


    console.log(
      "================================"
    );


    return locationData;

  } catch (error) {

    console.error(
      "❌ Geocoding Error:",
      error
    );

    return null;
  }
}


// ==========================================
// 12. GET ROAD ROUTE
// ==========================================

export async function getRouteData(
  pickup,
  destination
) {
  try {

    console.log(
      "================================"
    );

    console.log(
      "🚗 GETTING ROAD ROUTE"
    );

    console.log(
      "Pickup:",
      pickup
    );

    console.log(
      "Destination:",
      destination
    );


    // ========================================
    // STEP 1
    // GEOCODE PICKUP
    // ========================================

    const start =
      await geocodeLocation(
        pickup
      );


    if (!start) {

      console.error(
        "❌ Pickup not found:",
        pickup
      );

      return null;
    }


    console.log(
      "📍 Pickup Coordinates:",
      start.lat,
      start.lon
    );


    // ========================================
    // STEP 2
    // DESTINATION CONTEXT
    // ========================================

    const destinationContext = {
      city: start.city,
      state: start.state,
      country: start.country || "India",
    };


    console.log(
      "📍 Destination Context:",
      destinationContext
    );


    // ========================================
    // STEP 3
    // GEOCODE DESTINATION
    // ========================================

    const end =
      await geocodeLocation(
        destination,
        destinationContext
      );


    if (!end) {

      console.error(
        "❌ Destination not found:",
        destination
      );

      return null;
    }


    console.log(
      "🎯 Destination Coordinates:",
      end.lat,
      end.lon
    );


    // ========================================
    // STEP 4
    // CITY CHECK
    // ========================================

    if (
      start.city &&
      end.city
    ) {

      console.log(
        "Pickup City:",
        start.city
      );

      console.log(
        "Destination City:",
        end.city
      );


      if (
        normalizeText(start.city) !==
        normalizeText(end.city)
      ) {

        console.warn(
          "⚠️ Pickup and destination are in different cities."
        );
      }
    }


    // ========================================
    // STEP 5
    // OSRM ROUTE
    // ========================================

    const routeUrl =
      "https://router.project-osrm.org/route/v1/driving/" +
      `${start.lon},${start.lat};` +
      `${end.lon},${end.lat}` +
      "?overview=full&geometries=geojson";


    console.log(
      "🛣️ OSRM Route URL:",
      routeUrl
    );


    const routeResponse =
      await fetch(
        routeUrl
      );


    if (!routeResponse.ok) {

      throw new Error(
        `Route service failed: ${routeResponse.status}`
      );
    }


    const routeData =
      await routeResponse.json();


    if (
      routeData.code !== "Ok" ||
      !routeData.routes ||
      routeData.routes.length === 0
    ) {

      console.error(
        "❌ No road route found:",
        routeData
      );

      return null;
    }


    // ========================================
    // STEP 6
    // FIRST ROUTE
    // ========================================

    const route =
      routeData.routes[0];


    // ========================================
    // STEP 7
    // ROAD DISTANCE
    // ========================================

    const roadDistanceKm =
      Number(
        (
          route.distance / 1000
        ).toFixed(2)
      );


    // ========================================
    // STEP 8
    // ROAD TIME
    // ========================================

    const roadTimeMinutes =
      Math.round(
        route.duration / 60
      );


    // ========================================
    // STEP 9
    // CONVERT ROUTE COORDINATES
    //
    // OSRM:
    // [longitude, latitude]
    //
    // Leaflet:
    // [latitude, longitude]
    // ========================================

    const routeCoordinates =
      route.geometry.coordinates.map(
        (point) => [
          Number(point[1]),
          Number(point[0]),
        ]
      );


    // ========================================
    // STEP 10
    // COMPLETE DATA
    // ========================================

    const completeRouteData = {

      pickup: start,

      destination: end,

      distanceKm:
        roadDistanceKm,

      travelTime:
        `${Math.max(
          1,
          roadTimeMinutes
        )} min`,

      routeCoordinates:
        routeCoordinates,

      routeFound: true,
    };


    console.log(
      "================================"
    );

    console.log(
      "✅ COMPLETE ROAD ROUTE"
    );

    console.log(
      "Pickup:",
      start.displayName
    );

    console.log(
      "Pickup Coordinates:",
      start.lat,
      start.lon
    );

    console.log(
      "Destination:",
      end.displayName
    );

    console.log(
      "Destination Coordinates:",
      end.lat,
      end.lon
    );

    console.log(
      "Road Distance:",
      roadDistanceKm,
      "km"
    );

    console.log(
      "Road Time:",
      roadTimeMinutes,
      "minutes"
    );

    console.log(
      "Route Points:",
      routeCoordinates.length
    );

    console.log(
      "================================"
    );


    return completeRouteData;

  } catch (error) {

    console.error(
      "❌ Route Data Error:",
      error
    );

    return null;
  }
}