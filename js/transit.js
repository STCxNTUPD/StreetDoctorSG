/* ============================================================
 * Street Doctor SG — transit stations (curated subset)
 * A representative set of Singapore MRT/LRT stations for the
 * prototype's transit layer. In production, replace with the
 * official LTA DataMall train-station / bus-stop datasets.
 * Format: [name, lineCodes, lat, lng, type]
 * ============================================================ */

const TRANSIT_LINE_COLORS = {
  NS: "#d42e12", // North-South
  EW: "#009645", // East-West
  NE: "#9900aa", // North-East
  CC: "#fa9e0d", // Circle
  DT: "#005ec4", // Downtown
  TE: "#9D5B25", // Thomson-East Coast
  LRT: "#748477",
};

const _T = [
  // ---- North-South Line ----
  ["Jurong East", "NS,EW", 1.3331, 103.7422, "MRT"],
  ["Bukit Batok", "NS", 1.3490, 103.7496, "MRT"],
  ["Choa Chu Kang", "NS", 1.3854, 103.7443, "MRT"],
  ["Woodlands", "NS,TE", 1.4370, 103.7865, "MRT"],
  ["Yishun", "NS", 1.4294, 103.8350, "MRT"],
  ["Ang Mo Kio", "NS", 1.3700, 103.8495, "MRT"],
  ["Bishan", "NS,CC", 1.3510, 103.8489, "MRT"],
  ["Toa Payoh", "NS", 1.3326, 103.8474, "MRT"],
  ["Novena", "NS", 1.3203, 103.8438, "MRT"],
  ["Newton", "NS,DT", 1.3138, 103.8383, "MRT"],
  ["Orchard", "NS,TE", 1.3041, 103.8320, "MRT"],
  ["Somerset", "NS", 1.3007, 103.8388, "MRT"],
  ["Dhoby Ghaut", "NS,NE,CC", 1.2992, 103.8456, "MRT"],
  ["City Hall", "NS,EW", 1.2931, 103.8520, "MRT"],
  ["Raffles Place", "NS,EW", 1.2840, 103.8515, "MRT"],
  ["Marina Bay", "NS,TE", 1.2761, 103.8546, "MRT"],
  // ---- East-West Line ----
  ["Pasir Ris", "EW", 1.3729, 103.9493, "MRT"],
  ["Tampines", "EW,DT", 1.3536, 103.9451, "MRT"],
  ["Bedok", "EW", 1.3240, 103.9300, "MRT"],
  ["Paya Lebar", "EW,CC", 1.3181, 103.8927, "MRT"],
  ["Eunos", "EW", 1.3197, 103.9030, "MRT"],
  ["Aljunied", "EW", 1.3164, 103.8829, "MRT"],
  ["Kallang", "EW", 1.3115, 103.8714, "MRT"],
  ["Lavender", "EW", 1.3074, 103.8631, "MRT"],
  ["Bugis", "EW,DT", 1.3009, 103.8559, "MRT"],
  ["Tanjong Pagar", "EW", 1.2765, 103.8459, "MRT"],
  ["Outram Park", "EW,NE,TE", 1.2803, 103.8395, "MRT"],
  ["Tiong Bahru", "EW", 1.2860, 103.8270, "MRT"],
  ["Redhill", "EW", 1.2896, 103.8167, "MRT"],
  ["Queenstown", "EW", 1.2945, 103.8060, "MRT"],
  ["Commonwealth", "EW", 1.3024, 103.7983, "MRT"],
  ["Buona Vista", "EW,CC", 1.3071, 103.7900, "MRT"],
  ["Clementi", "EW", 1.3151, 103.7652, "MRT"],
  ["Boon Lay", "EW", 1.3385, 103.7059, "MRT"],
  // ---- North-East Line ----
  ["HarbourFront", "NE,CC", 1.2653, 103.8220, "MRT"],
  ["Chinatown", "NE,DT", 1.2847, 103.8443, "MRT"],
  ["Clarke Quay", "NE", 1.2885, 103.8466, "MRT"],
  ["Little India", "NE,DT", 1.3066, 103.8493, "MRT"],
  ["Farrer Park", "NE", 1.3124, 103.8543, "MRT"],
  ["Boon Keng", "NE", 1.3193, 103.8616, "MRT"],
  ["Potong Pasir", "NE", 1.3313, 103.8686, "MRT"],
  ["Serangoon", "NE,CC", 1.3496, 103.8736, "MRT"],
  ["Kovan", "NE", 1.3601, 103.8850, "MRT"],
  ["Hougang", "NE", 1.3713, 103.8925, "MRT"],
  ["Buangkok", "NE", 1.3829, 103.8932, "MRT"],
  ["Sengkang", "NE,LRT", 1.3917, 103.8954, "MRT"],
  ["Punggol", "NE,LRT", 1.4052, 103.9024, "MRT"],
  // ---- Circle Line ----
  ["Esplanade", "CC", 1.2935, 103.8557, "MRT"],
  ["Promenade", "CC,DT", 1.2933, 103.8610, "MRT"],
  ["Stadium", "CC", 1.3028, 103.8753, "MRT"],
  ["Mountbatten", "CC", 1.3061, 103.8826, "MRT"],
  ["Dakota", "CC", 1.3083, 103.8884, "MRT"],
  ["MacPherson", "CC,DT", 1.3267, 103.8900, "MRT"],
  ["Tai Seng", "CC", 1.3360, 103.8880, "MRT"],
  ["Bartley", "CC", 1.3428, 103.8799, "MRT"],
  ["Lorong Chuan", "CC", 1.3517, 103.8642, "MRT"],
  ["Marymount", "CC", 1.3490, 103.8395, "MRT"],
  ["Caldecott", "CC,TE", 1.3377, 103.8395, "MRT"],
  ["Botanic Gardens", "CC,DT", 1.3224, 103.8157, "MRT"],
  ["Holland Village", "CC", 1.3119, 103.7960, "MRT"],
  ["one-north", "CC", 1.2994, 103.7873, "MRT"],
  ["Kent Ridge", "CC", 1.2935, 103.7845, "MRT"],
  ["Labrador Park", "CC", 1.2723, 103.8027, "MRT"],
  ["Telok Blangah", "CC", 1.2707, 103.8097, "MRT"],
  // ---- Downtown Line ----
  ["Bukit Panjang", "DT,LRT", 1.3786, 103.7625, "MRT"],
  ["Beauty World", "DT", 1.3415, 103.7758, "MRT"],
  ["Stevens", "DT,TE", 1.3199, 103.8259, "MRT"],
  ["Rochor", "DT", 1.3037, 103.8525, "MRT"],
  ["Bayfront", "DT,CC", 1.2820, 103.8590, "MRT"],
  ["Downtown", "DT", 1.2796, 103.8530, "MRT"],
  ["Telok Ayer", "DT", 1.2822, 103.8484, "MRT"],
  ["Bencoolen", "DT", 1.2985, 103.8500, "MRT"],
  ["Bendemeer", "DT", 1.3138, 103.8617, "MRT"],
  ["Ubi", "DT", 1.3300, 103.8993, "MRT"],
  ["Bedok North", "DT", 1.3349, 103.9181, "MRT"],
  ["Bedok Reservoir", "DT", 1.3367, 103.9120, "MRT"],
  ["Tampines West", "DT", 1.3455, 103.9384, "MRT"],
  ["Expo", "DT,EW", 1.3354, 103.9617, "MRT"],
  // ---- Thomson-East Coast Line ----
  ["Springleaf", "TE", 1.3974, 103.8175, "MRT"],
  ["Upper Thomson", "TE", 1.3543, 103.8334, "MRT"],
  ["Great World", "TE", 1.2937, 103.8320, "MRT"],
  ["Havelock", "TE", 1.2882, 103.8338, "MRT"],
  ["Maxwell", "TE", 1.2806, 103.8443, "MRT"],
  ["Gardens by the Bay", "TE", 1.2790, 103.8689, "MRT"],
  // ---- A few LRT stops ----
  ["Choa Chu Kang LRT", "LRT", 1.3852, 103.7447, "LRT"],
  ["Compassvale", "LRT", 1.3944, 103.9003, "LRT"],
  ["Rumbia", "LRT", 1.3915, 103.9058, "LRT"],
  ["Cove", "LRT", 1.3992, 103.9059, "LRT"],
  ["Damai", "LRT", 1.4053, 103.9085, "LRT"],
  ["Senja", "LRT", 1.3829, 103.7623, "LRT"],
];

const TRANSIT_STATIONS = _T.map(([name, lines, lat, lng, type], i) => {
  const lineArr = lines.split(",");
  return {
    id: "ts-" + i,
    name,
    lines: lineArr,
    type,                                  // "MRT" | "LRT"
    color: TRANSIT_LINE_COLORS[lineArr[0]] || "#555",
    lat, lng,
  };
});
