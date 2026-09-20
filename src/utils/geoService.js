// ==========================================
// GEO SERVICE
// SmartRide AI - Dynamic Location & Route Service
// ==========================================


// ==========================================
// 1. CALCULATE DISTANCE
// ==========================================

export function getDistanceInKm(
  lat1,
  lon1,
  lat2,
  lon2
) {
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

function createSearchUrl(
  query,
  indiaOnly = false
) {
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
// 5. SCORE RESULT
// ==========================================

function scoreResult(
  result,
  searchText,
  context = null
) {
  let score = 0;

  const input =
    normalizeText(searchText);

  const displayName =
    normalizeText(
      result.display_name
    );

  const name =
    normalizeText(result.name);

  const address =
    result.address || {};

  const road =
    normalizeText(address.road);

  const suburb =
    normalizeText(address.suburb);

  const neighbourhood =
    normalizeText(
      address.neighbourhood
    );

  const city =
    normalizeText(
      address.city ||
      address.town ||
      address.municipality ||
      address.village ||
      address.county
    );

  const district =
    normalizeText(
      address.city_district ||
      address.county
    );

  const state =
    normalizeText(address.state);

  const country =
    normalizeText(address.country);


  // ==========================================
  // EXACT MATCHES
  // ==========================================

  if (name === input) {
    score += 150;
  }

  if (suburb === input) {
    score += 150;
  }

  if (neighbourhood === input) {
    score += 150;
  }

  if (road === input) {
    score += 140;
  }

  if (city === input) {
    score += 120;
  }


  // ==========================================
  // PARTIAL MATCHES
  // ==========================================

  if (name.includes(input)) {
    score += 80;
  }

  if (suburb.includes(input)) {
    score += 80;
  }

  if (neighbourhood.includes(input)) {
    score += 80;
  }

  if (road.includes(input)) {
    score += 70;
  }

  if (displayName.includes(input)) {
    score += 40;
  }


  // ==========================================
  // CONTEXT MATCH
  // Pickup city/state is used here
  // ==========================================

  if (context) {
    const contextCity =
      normalizeText(context.city);

    const contextState =
      normalizeText(context.state);

    const contextCountry =
      normalizeText(context.country);


    // Same city
    if (
      contextCity &&
      (
        city === contextCity ||
        suburb === contextCity ||
        neighbourhood === contextCity ||
        displayName.includes(contextCity)
      )
    ) {
      score += 250;

      console.log(
        "✅ Same city context:",
        contextCity
      );
    }


    // Same state
    if (
      contextState &&
      state &&
      state.includes(contextState)
    ) {
      score += 100;
    }


    // Same country
    if (
      contextCountry &&
      country &&
      country.includes(contextCountry)
    ) {
      score += 30;
    }
  }


  // ==========================================
  // LOCATION TYPE
  // ==========================================

  const type =
    normalizeText(result.type);

  const category =
    normalizeText(result.category);

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
    score += 30;
  }

  if (
    type === "city" ||
    type === "town" ||
    type === "village"
  ) {
    score += 25;
  }

  if (category === "place") {
    score += 15;
  }


  // ==========================================
  // PENALTY
  // Result doesn't contain searched name
  // ==========================================

  if (
    !name.includes(input) &&
    !suburb.includes(input) &&
    !neighbourhood.includes(input) &&
    !road.includes(input) &&
    !city.includes(input) &&
    !displayName.includes(input)
  ) {
    score -= 100;
  }


  return score;
}


// ==========================================
// 6. SELECT BEST RESULT
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
    (a, b) =>
      b.score - a.score
  );

  console.log(
    "================================"
  );

  console.log(
    "📊 Scored Location Results:"
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
// 7. CONVERT NOMINATIM RESULT
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
    address.city ||
    address.town ||
    address.municipality ||
    address.village ||
    address.county ||
    "";

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
// 8. GEOCODE LOCATION
// General dynamic search
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
        "Location is empty"
      );

      return null;
    }

    const searchText =
      location.trim();

    console.log(
      "================================"
    );

    console.log(
      "🔎 Searching location:",
      searchText
    );


    // ==========================================
    // CONTEXT SEARCH
    // Used when pickup city is known
    // ==========================================

    if (
      context &&
      context.city
    ) {
      const contextQuery =
        `${searchText}, ${context.city}` +
        `${context.state ? ", " + context.state : ""}` +
        `${context.country ? ", " + context.country : ""}`;

      console.log(
        "📍 Context Search:",
        contextQuery
      );


      const contextUrl =
        createSearchUrl(
          contextQuery,
          false
        );

      console.log(
        "Context Search URL:",
        contextUrl
      );


      const contextResponse =
        await fetch(
          contextUrl,
          {
            headers: {
              Accept:
                "application/json",
            },
          }
        );


      if (
        contextResponse.ok
      ) {
        const contextData =
          await contextResponse.json();


        console.log(
          "Context Search Results:",
          contextData
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
    }


    // ==========================================
    // NORMAL SEARCH
    // ==========================================

    let url =
      createSearchUrl(
        searchText,
        false
      );

    console.log(
      "Search URL:",
      url
    );


    let response =
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


    let data =
      await response.json();


    console.log(
      "General Search Results:",
      data
    );


    // ==========================================
    // INDIA FALLBACK
    // ==========================================

    if (
      !data ||
      data.length === 0
    ) {
      const indiaQuery =
        `${searchText}, India`;

      console.log(
        "🇮🇳 Trying India Search:",
        indiaQuery
      );


      url =
        createSearchUrl(
          indiaQuery,
          true
        );


      response =
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
          `India geocoding failed: ${response.status}`
        );
      }


      data =
        await response.json();


      console.log(
        "India Search Results:",
        data
      );
    }


    // ==========================================
    // NO RESULT
    // ==========================================

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


    // ==========================================
    // SELECT BEST RESULT
    // ==========================================

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
// 9. GET ROAD ROUTE
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
      "🚗 Getting road route..."
    );

    console.log(
      "Pickup:",
      pickup
    );

    console.log(
      "Destination:",
      destination
    );


    // ==========================================
    // STEP 1
    // GEOCODE PICKUP
    // ==========================================

    const start =
      await geocodeLocation(
        pickup
      );


    if (!start) {
      console.error(
        "❌ Pickup location not found:",
        pickup
      );

      return null;
    }


    console.log(
      "📍 Pickup Location:",
      start
    );


    // ==========================================
    // STEP 2
    // CREATE DYNAMIC DESTINATION CONTEXT
    // ==========================================

    const destinationContext = {
      city: start.city,

      state: start.state,

      country: start.country,
    };


    console.log(
      "📌 Destination Search Context:",
      destinationContext
    );


    // ==========================================
    // STEP 3
    // GEOCODE DESTINATION
    // USING PICKUP CITY CONTEXT
    // ==========================================

    const end =
      await geocodeLocation(
        destination,
        destinationContext
      );


    if (!end) {
      console.error(
        "❌ Destination location not found:",
        destination
      );

      return null;
    }


    console.log(
      "🎯 Destination Location:",
      end
    );


    // ==========================================
    // STEP 4
    // VALIDATE SAME CITY WHEN POSSIBLE
    // ==========================================

    if (
      start.city &&
      end.city
    ) {

      console.log(
        "🏙️ Pickup City:",
        start.city
      );

      console.log(
        "🏙️ Destination City:",
        end.city
      );


      if (
        normalizeText(start.city) !==
        normalizeText(end.city)
      ) {

        console.warn(
          "⚠️ Pickup and destination cities are different."
        );

      }

    }


    // ==========================================
    // STEP 5
    // OSRM ROAD ROUTE
    // ==========================================

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
      await fetch(routeUrl);


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


    // ==========================================
    // STEP 6
    // FIRST ROAD ROUTE
    // ==========================================

    const route =
      routeData.routes[0];


    const roadDistanceKm =
      Number(
        (
          route.distance / 1000
        ).toFixed(2)
      );


    const roadTimeMinutes =
      Math.round(
        route.duration / 60
      );


    // ==========================================
    // STEP 7
    // CONVERT ROUTE COORDINATES
    // OSRM [lon, lat]
    // Leaflet [lat, lon]
    // ==========================================

    const routeCoordinates =
      route.geometry.coordinates.map(
        (point) => [
          Number(point[1]),
          Number(point[0]),
        ]
      );


    // ==========================================
    // STEP 8
    // COMPLETE ROUTE DATA
    // ==========================================

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
      "✅ COMPLETE ROAD ROUTE:",
      completeRouteData
    );

    console.log(
      "📍 Correct Pickup:",
      start.displayName,
      start.lat,
      start.lon
    );

    console.log(
      "🎯 Correct Destination:",
      end.displayName,
      end.lat,
      end.lon
    );

    console.log(
      "📏 Road Distance:",
      roadDistanceKm,
      "km"
    );

    console.log(
      "🗺️ Route Points:",
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