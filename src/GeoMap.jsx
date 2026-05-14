import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

// ─── World-level data ────────────────────────────────────────────────────────
const DC_DATA = [
  { country: "United States", code: "US", count: 4184, lat: 39.5, lon: -98.35 },
  { country: "United Kingdom", code: "GB", count: 515, lat: 55.3781, lon: -3.436 },
  { country: "Germany", code: "DE", count: 514, lat: 51.1657, lon: 10.4515 },
  { country: "China", code: "CN", count: 368, lat: 35.8617, lon: 104.1954 },
  { country: "France", code: "FR", count: 344, lat: 46.2276, lon: 2.2137 },
  { country: "Canada", code: "CA", count: 336, lat: 56.1304, lon: -106.3468 },
  { country: "Australia", code: "AU", count: 290, lat: -25.2744, lon: 133.7751 },
  { country: "Netherlands", code: "NL", count: 210, lat: 52.1326, lon: 5.2913 },
  { country: "Japan", code: "JP", count: 205, lat: 36.2048, lon: 138.2529 },
  { country: "Russia", code: "RU", count: 190, lat: 61.524, lon: 105.3188 },
  { country: "Brazil", code: "BR", count: 180, lat: -14.235, lon: -51.9253 },
  { country: "India", code: "IN", count: 155, lat: 20.5937, lon: 78.9629 },
  { country: "Singapore", code: "SG", count: 130, lat: 1.3521, lon: 103.8198 },
  { country: "Sweden", code: "SE", count: 115, lat: 60.1282, lon: 18.6435 },
  { country: "South Korea", code: "KR", count: 110, lat: 35.9078, lon: 127.7669 },
  { country: "UAE", code: "AE", count: 95, lat: 23.4241, lon: 53.8478 },
  { country: "Switzerland", code: "CH", count: 88, lat: 46.8182, lon: 8.2275 },
  { country: "Mexico", code: "MX", count: 85, lat: 23.6345, lon: -102.5528 },
  { country: "Poland", code: "PL", count: 75, lat: 51.9194, lon: 19.1451 },
  { country: "South Africa", code: "ZA", count: 60, lat: -30.5595, lon: 22.9375 },
];

// ─── Hierarchical drill-down data ────────────────────────────────────────────
const DC_HIERARCHY = {
  US: {
    name: "United States", lat: 39.5, lon: -98.35, zoom: 3.5,
    states: [
      {
        name: "Virginia", count: 890, lat: 37.4316, lon: -78.6569,
        cities: [
          { name: "Ashburn", count: 450, lat: 39.0438, lon: -77.4874, centers: [
            { name: "Equinix DC1", zip: "20147", address: "21715 Filigree Ct", type: "Colocation", operator: "Equinix", mw: 100 },
            { name: "Iron Mountain NVA1", zip: "20166", address: "45901 Nokes Blvd", type: "Colocation", operator: "Iron Mountain", mw: 90 },
            { name: "CyrusOne Sterling I", zip: "20164", address: "21834 Rugby Rd", type: "Colocation", operator: "CyrusOne", mw: 60 },
            { name: "Digital Realty IAD", zip: "20147", address: "44060 Digital Loudoun Plz", type: "Colocation", operator: "Digital Realty", mw: 80 },
            { name: "CoreWeave VA1", zip: "20166", address: "46880 Lustre Ct, Sterling", type: "AI", operator: "CoreWeave", mw: 200 },
            { name: "Microsoft AI East", zip: "20147", address: "13600 EDS Dr, Herndon", type: "AI", operator: "Microsoft", mw: 180 },
          ]},
          { name: "Reston", count: 190, lat: 38.9586, lon: -77.357, centers: [
            { name: "Equinix DC2", zip: "20191", address: "12000 Sunrise Valley Dr", type: "Colocation", operator: "Equinix", mw: 45 },
            { name: "Zayo Reston", zip: "20190", address: "11480 Commerce Park Dr", type: "Colocation", operator: "Zayo", mw: 30 },
          ]},
          { name: "Richmond", count: 130, lat: 37.5407, lon: -77.436, centers: [
            { name: "Switch RVA1", zip: "23219", address: "1 Discovery Square", type: "Colocation", operator: "Switch", mw: 50 },
          ]},
        ],
      },
      {
        name: "California", count: 680, lat: 36.7783, lon: -119.4179,
        cities: [
          { name: "San Jose", count: 220, lat: 37.3382, lon: -121.8863, centers: [
            { name: "Equinix SV1", zip: "95110", address: "11 Great Oaks Blvd", type: "Colocation", operator: "Equinix", mw: 20 },
            { name: "Equinix SV5", zip: "95134", address: "2000 N First St", type: "Colocation", operator: "Equinix", mw: 18 },
            { name: "Digital Realty SJC", zip: "95112", address: "2820 Northwestern Pkwy", type: "Colocation", operator: "Digital Realty", mw: 25 },
            { name: "CoreWeave SJC1", zip: "95134", address: "1060 N McCarthy Blvd", type: "AI", operator: "CoreWeave", mw: 150 },
            { name: "Lambda Labs SJC", zip: "95110", address: "303 Almaden Blvd", type: "AI", operator: "Lambda Labs", mw: 40 },
            { name: "NVIDIA DGX Cloud SV", zip: "95051", address: "2788 San Tomas Expy", type: "AI", operator: "NVIDIA", mw: 60 },
          ]},
          { name: "Los Angeles", count: 180, lat: 34.0522, lon: -118.2437, centers: [
            { name: "CoreSite LA1", zip: "90001", address: "900 N Alameda St", type: "Colocation", operator: "CoreSite", mw: 40 },
            { name: "Equinix LA1", zip: "90021", address: "1 Wilshire Blvd", type: "Colocation", operator: "Equinix", mw: 35 },
            { name: "Zayo Los Angeles", zip: "90012", address: "624 S Grand Ave", type: "Colocation", operator: "Zayo", mw: 15 },
          ]},
          { name: "San Francisco", count: 190, lat: 37.7749, lon: -122.4194, centers: [
            { name: "Equinix SF1", zip: "94107", address: "200 Paul Ave", type: "Colocation", operator: "Equinix", mw: 30 },
            { name: "Digital Realty SFO", zip: "94134", address: "365 Main St", type: "Colocation", operator: "Digital Realty", mw: 25 },
          ]},
          { name: "Sacramento", count: 90, lat: 38.5816, lon: -121.4944, centers: [
            { name: "Surewest SAC1", zip: "95814", address: "926 J St", type: "Colocation", operator: "Surewest", mw: 10 },
          ]},
        ],
      },
      {
        name: "Texas", count: 520, lat: 31.9686, lon: -99.9018,
        cities: [
          { name: "Dallas", count: 280, lat: 32.7767, lon: -96.797, centers: [
            { name: "Equinix DA1", zip: "75247", address: "2323 Bryan St", type: "Colocation", operator: "Equinix", mw: 60 },
            { name: "CyrusOne Dallas", zip: "75207", address: "1649 W Frankford Rd", type: "Colocation", operator: "CyrusOne", mw: 70 },
            { name: "Digital Realty DFW", zip: "75207", address: "900 Hideaway Ln", type: "Hyperscale", operator: "Digital Realty", mw: 100 },
            { name: "CoreWeave DAL1", zip: "75244", address: "14901 Quorum Dr", type: "AI", operator: "CoreWeave", mw: 120 },
            { name: "Crusoe AI Dallas", zip: "75201", address: "1900 McKinney Ave", type: "AI", operator: "Crusoe Energy", mw: 50 },
          ]},
          { name: "Austin", count: 150, lat: 30.2672, lon: -97.7431, centers: [
            { name: "Flexential Austin", zip: "78741", address: "5000 Spectrum Dr", type: "Colocation", operator: "Flexential", mw: 20 },
            { name: "QTS Austin", zip: "78750", address: "8401 Anderson Mill Rd", type: "Colocation", operator: "QTS", mw: 30 },
          ]},
          { name: "San Antonio", count: 90, lat: 29.4241, lon: -98.4936, centers: [
            { name: "Rackspace SA1", zip: "78218", address: "1 Fanatical Pl", type: "Colocation", operator: "Rackspace", mw: 40 },
          ]},
        ],
      },
      {
        name: "New York", count: 420, lat: 42.1657, lon: -74.9481,
        cities: [
          { name: "New York City", count: 280, lat: 40.7128, lon: -74.006, centers: [
            { name: "Equinix NY4", zip: "07094", address: "755 Secaucus Rd", type: "Colocation", operator: "Equinix", mw: 45 },
            { name: "Digital Realty NYC", zip: "10001", address: "111 8th Ave", type: "Colocation", operator: "Digital Realty", mw: 50 },
            { name: "Telx New York", zip: "10013", address: "60 Hudson St", type: "Colocation", operator: "Telx", mw: 20 },
          ]},
          { name: "Buffalo", count: 80, lat: 42.8864, lon: -78.8784, centers: [
            { name: "Synacor BUF1", zip: "14202", address: "40 La Riviere Dr", type: "Colocation", operator: "Synacor", mw: 8 },
          ]},
          { name: "Albany", count: 60, lat: 42.6526, lon: -73.7562, centers: [
            { name: "TechValley ALB1", zip: "12207", address: "251 Fuller Rd", type: "Colocation", operator: "TechValley", mw: 5 },
          ]},
        ],
      },
      {
        name: "Washington", count: 340, lat: 47.7511, lon: -120.7401,
        cities: [
          { name: "Seattle", count: 200, lat: 47.6062, lon: -122.3321, centers: [
            { name: "Equinix SE2", zip: "98101", address: "2001 Sixth Ave", type: "Colocation", operator: "Equinix", mw: 30 },
            { name: "TierPoint SEA", zip: "98134", address: "2001 Utah Ave S", type: "Colocation", operator: "TierPoint", mw: 20 },
          ]},
          { name: "Quincy", count: 140, lat: 47.2343, lon: -119.8526, centers: [
            { name: "Microsoft Quincy DC", zip: "98848", address: "1 Microsoft Way", type: "Hyperscale", operator: "Microsoft", mw: 200 },
            { name: "Dell QCY Campus", zip: "98848", address: "400 Silica Dr NW", type: "Hyperscale", operator: "Dell", mw: 150 },
            { name: "Microsoft OpenAI Training", zip: "98848", address: "2 Microsoft Way", type: "AI", operator: "Microsoft / OpenAI", mw: 300 },
          ]},
        ],
      },
      {
        name: "Illinois", count: 280, lat: 40.6331, lon: -89.3985,
        cities: [
          { name: "Chicago", count: 280, lat: 41.8781, lon: -87.6298, centers: [
            { name: "Equinix CH1", zip: "60661", address: "1 N Dearborn St", type: "Colocation", operator: "Equinix", mw: 35 },
            { name: "CyrusOne Chicago", zip: "60607", address: "350 E Cermak Rd", type: "Colocation", operator: "CyrusOne", mw: 50 },
            { name: "Internap Chicago", zip: "60601", address: "350 N Orleans St", type: "Colocation", operator: "Internap", mw: 15 },
          ]},
        ],
      },
      {
        name: "Georgia", count: 220, lat: 32.1656, lon: -82.9001,
        cities: [
          { name: "Atlanta", count: 220, lat: 33.749, lon: -84.388, centers: [
            { name: "Equinix AT1", zip: "30303", address: "56 Marietta St NW", type: "Colocation", operator: "Equinix", mw: 40 },
            { name: "Digital Realty ATL", zip: "30328", address: "250 Williams St NW", type: "Colocation", operator: "Digital Realty", mw: 45 },
          ]},
        ],
      },
      {
        name: "Arizona", count: 154, lat: 34.0489, lon: -111.0937,
        cities: [
          { name: "Phoenix", count: 154, lat: 33.4484, lon: -112.074, centers: [
            { name: "Compass PHX1", zip: "85034", address: "1120 S Price Rd", type: "Hyperscale", operator: "Compass", mw: 120 },
            { name: "CyrusOne Phoenix", zip: "85034", address: "1234 S Price Rd", type: "Colocation", operator: "CyrusOne", mw: 60 },
          ]},
        ],
      },
    ],
  },
  GB: {
    name: "United Kingdom", lat: 54.5, lon: -2.5, zoom: 14,
    states: [
      {
        name: "England", count: 430, lat: 52.3555, lon: -1.1743,
        cities: [
          { name: "London", count: 310, lat: 51.5074, lon: -0.1278, centers: [
            { name: "Equinix LD4", zip: "SL1 4FQ", address: "8 Buckingham Ave, Slough", type: "Colocation", operator: "Equinix", mw: 65 },
            { name: "Digital Realty LHR", zip: "TW6 2GA", address: "8 Buckingham Ave", type: "Colocation", operator: "Digital Realty", mw: 40 },
            { name: "CyrusOne London", zip: "EC1A 1BB", address: "6 Braham St", type: "Colocation", operator: "CyrusOne", mw: 30 },
            { name: "Telehouse North", zip: "E14 9TN", address: "Coriander Ave, Docklands", type: "Colocation", operator: "Telehouse", mw: 25 },
            { name: "CoreWeave LDN1", zip: "E14 5AB", address: "25 Canada Square, Canary Wharf", type: "AI", operator: "CoreWeave", mw: 100 },
            { name: "xAI UK Compute", zip: "N1C 4AG", address: "1 Granary Square, Kings Cross", type: "AI", operator: "xAI", mw: 80 },
          ]},
          { name: "Manchester", count: 80, lat: 53.4808, lon: -2.2426, centers: [
            { name: "Equinix MA1", zip: "M1 1AD", address: "Joule House, Rutherford St", type: "Colocation", operator: "Equinix", mw: 18 },
            { name: "UKFast MAN1", zip: "M12 6JH", address: "UKFast Campus, Birley Fields", type: "Colocation", operator: "UKFast", mw: 10 },
          ]},
          { name: "Birmingham", count: 40, lat: 52.4862, lon: -1.8904, centers: [
            { name: "Pulsant BHX1", zip: "B7 4BB", address: "Colmore Row", type: "Colocation", operator: "Pulsant", mw: 8 },
          ]},
        ],
      },
      {
        name: "Scotland", count: 55, lat: 56.4907, lon: -4.2026,
        cities: [
          { name: "Edinburgh", count: 35, lat: 55.9533, lon: -3.1883, centers: [
            { name: "Redbus EDI1", zip: "EH1 1YZ", address: "16 Castle Terrace", type: "Colocation", operator: "Redbus", mw: 8 },
          ]},
          { name: "Glasgow", count: 20, lat: 55.8642, lon: -4.2518, centers: [
            { name: "BT GLA1", zip: "G1 1AB", address: "Pacific Quay", type: "Colocation", operator: "BT", mw: 5 },
          ]},
        ],
      },
      {
        name: "Wales", count: 30, lat: 52.1307, lon: -3.7837,
        cities: [
          { name: "Cardiff", count: 30, lat: 51.4816, lon: -3.1791, centers: [
            { name: "Next Gen WAL1", zip: "CF10 1EP", address: "Central Square", type: "Colocation", operator: "Next Generation", mw: 5 },
          ]},
        ],
      },
    ],
  },
  DE: {
    name: "Germany", lat: 51.2, lon: 10.5, zoom: 14,
    states: [
      {
        name: "Hesse", count: 180, lat: 50.6521, lon: 9.1624,
        cities: [
          { name: "Frankfurt", count: 180, lat: 50.1109, lon: 8.6821, centers: [
            { name: "Equinix FR4", zip: "60326", address: "Larchenstrasse 110", type: "Colocation", operator: "Equinix", mw: 55 },
            { name: "Digital Realty FRA", zip: "60314", address: "Hanauer Landstr 298", type: "Colocation", operator: "Digital Realty", mw: 45 },
            { name: "DE-CIX FRA1", zip: "60596", address: "Gutleutstrasse 310", type: "Colocation", operator: "DE-CIX", mw: 30 },
            { name: "Interxion FRA11", zip: "60314", address: "Hanauer Landstr 151", type: "Colocation", operator: "Interxion", mw: 40 },
            { name: "CoreWeave FRA1", zip: "60528", address: "Lyoner Str 26", type: "AI", operator: "CoreWeave", mw: 90 },
            { name: "Aleph Alpha AI DC", zip: "76131", address: "Vincenz-Priessnitz-Str 1", type: "AI", operator: "Aleph Alpha", mw: 40 },
          ]},
        ],
      },
      {
        name: "Bavaria", count: 140, lat: 48.7904, lon: 11.4979,
        cities: [
          { name: "Munich", count: 100, lat: 48.1351, lon: 11.582, centers: [
            { name: "Equinix MU1", zip: "80637", address: "Elsenheimerstrasse 41", type: "Colocation", operator: "Equinix", mw: 25 },
            { name: "Interxion MUC1", zip: "85748", address: "Werner-Heisenberg-Allee 4", type: "Colocation", operator: "Interxion", mw: 20 },
          ]},
          { name: "Nuremberg", count: 40, lat: 49.4521, lon: 11.0767, centers: [
            { name: "Hetzner NUE1", zip: "90441", address: "Industriestrasse 25", type: "Colocation", operator: "Hetzner", mw: 10 },
          ]},
        ],
      },
      {
        name: "North Rhine-Westphalia", count: 120, lat: 51.4332, lon: 7.6616,
        cities: [
          { name: "Düsseldorf", count: 60, lat: 51.2217, lon: 6.7762, centers: [
            { name: "Equinix DU1", zip: "40549", address: "Rather Str 49b", type: "Colocation", operator: "Equinix", mw: 15 },
          ]},
          { name: "Cologne", count: 60, lat: 50.9333, lon: 6.95, centers: [
            { name: "Interxion CGN1", zip: "50825", address: "Subbelrather Str 15a", type: "Colocation", operator: "Interxion", mw: 20 },
          ]},
        ],
      },
      {
        name: "Berlin", count: 74, lat: 52.52, lon: 13.405,
        cities: [
          { name: "Berlin", count: 74, lat: 52.52, lon: 13.405, centers: [
            { name: "Equinix BE2", zip: "10178", address: "Erika-Heß-Eisstadion", type: "Colocation", operator: "Equinix", mw: 20 },
            { name: "Telehouse Berlin", zip: "10115", address: "Zimmerstr 69", type: "Colocation", operator: "Telehouse", mw: 15 },
          ]},
        ],
      },
    ],
  },
  CN: {
    name: "China", lat: 35.8617, lon: 104.1954, zoom: 4,
    states: [
      {
        name: "Beijing", count: 95, lat: 39.9042, lon: 116.4074,
        cities: [
          { name: "Beijing", count: 95, lat: 39.9042, lon: 116.4074, centers: [
            { name: "GDS Beijing DC1", zip: "100176", address: "Tongzhou Economic Dev Zone", type: "Hyperscale", operator: "GDS", mw: 80 },
            { name: "21Vianet BJ1", zip: "100043", address: "Shijingshan District", type: "Colocation", operator: "21Vianet", mw: 40 },
          ]},
        ],
      },
      {
        name: "Shanghai", count: 85, lat: 31.2304, lon: 121.4737,
        cities: [
          { name: "Shanghai", count: 85, lat: 31.2304, lon: 121.4737, centers: [
            { name: "Equinix SH1", zip: "201210", address: "Zhangjiang Hi-Tech Park", type: "Colocation", operator: "Equinix", mw: 35 },
            { name: "GDS Shanghai DC2", zip: "200120", address: "Pudong New Area", type: "Hyperscale", operator: "GDS", mw: 60 },
          ]},
        ],
      },
      {
        name: "Guangdong", count: 120, lat: 23.3417, lon: 113.4244,
        cities: [
          { name: "Guangzhou", count: 70, lat: 23.1291, lon: 113.2644, centers: [
            { name: "China Telecom GZ1", zip: "510000", address: "Tianhe District", type: "Colocation", operator: "China Telecom", mw: 50 },
          ]},
          { name: "Shenzhen", count: 50, lat: 22.5431, lon: 114.0579, centers: [
            { name: "Tencent SZX1", zip: "518057", address: "Nanshan District", type: "Hyperscale", operator: "Tencent", mw: 100 },
          ]},
        ],
      },
      {
        name: "Inner Mongolia", count: 68, lat: 44.0935, lon: 113.9448,
        cities: [
          { name: "Hohhot", count: 68, lat: 40.8426, lon: 111.7498, centers: [
            { name: "China Mobile HHT1", zip: "010000", address: "Economic Development Zone", type: "Hyperscale", operator: "China Mobile", mw: 200 },
          ]},
        ],
      },
    ],
  },
  FR: {
    name: "France", lat: 46.2276, lon: 2.2137, zoom: 13,
    states: [
      {
        name: "Île-de-France", count: 220, lat: 48.8499, lon: 2.637,
        cities: [
          { name: "Paris", count: 220, lat: 48.8566, lon: 2.3522, centers: [
            { name: "Equinix PA3", zip: "92100", address: "114 Rue Ambroise Croizat, Clichy", type: "Colocation", operator: "Equinix", mw: 30 },
            { name: "Interxion PAR7", zip: "93200", address: "114 Rue Ambroise Croizat", type: "Colocation", operator: "Interxion", mw: 25 },
            { name: "Digital Realty CDG", zip: "95700", address: "Zone Industrielle Gonesse", type: "Colocation", operator: "Digital Realty", mw: 35 },
          ]},
        ],
      },
      {
        name: "Auvergne-Rhône-Alpes", count: 80, lat: 45.7597, lon: 4.8422,
        cities: [
          { name: "Lyon", count: 80, lat: 45.764, lon: 4.8357, centers: [
            { name: "SFR Business LYO1", zip: "69008", address: "15 Rue du Dauphiné", type: "Colocation", operator: "SFR Business", mw: 12 },
            { name: "OVHcloud Lyon", zip: "69007", address: "50 Rue Dubuisson", type: "Colocation", operator: "OVHcloud", mw: 20 },
          ]},
        ],
      },
      {
        name: "Grand Est", count: 44, lat: 48.7, lon: 6.2,
        cities: [
          { name: "Strasbourg", count: 44, lat: 48.5734, lon: 7.7521, centers: [
            { name: "OVHcloud SBG1", zip: "67000", address: "5 Rue Buffon", type: "Colocation", operator: "OVHcloud", mw: 15 },
          ]},
        ],
      },
    ],
  },
  CA: {
    name: "Canada", lat: 56.0, lon: -96.0, zoom: 3,
    states: [
      {
        name: "Ontario", count: 150, lat: 51.2538, lon: -85.3232,
        cities: [
          { name: "Toronto", count: 130, lat: 43.6532, lon: -79.3832, centers: [
            { name: "Equinix TR1", zip: "M5J 2R8", address: "45 Parliament St", type: "Colocation", operator: "Equinix", mw: 35 },
            { name: "Digital Realty TOR", zip: "M9W 5L7", address: "905 King St W", type: "Colocation", operator: "Digital Realty", mw: 30 },
            { name: "Rogers YYZ1", zip: "M9L 1R2", address: "8 Eva Rd", type: "Colocation", operator: "Rogers", mw: 20 },
          ]},
          { name: "Ottawa", count: 20, lat: 45.4215, lon: -75.6972, centers: [
            { name: "CIX Ottawa", zip: "K1P 5H9", address: "80 Elgin St", type: "Government", operator: "CIX", mw: 8 },
          ]},
        ],
      },
      {
        name: "British Columbia", count: 100, lat: 53.7267, lon: -127.6476,
        cities: [
          { name: "Vancouver", count: 100, lat: 49.2827, lon: -123.1207, centers: [
            { name: "Equinix VA1", zip: "V6B 1A4", address: "555 W Hastings St", type: "Colocation", operator: "Equinix", mw: 25 },
            { name: "TELUS VAN1", zip: "V6C 1T2", address: "1095 W Pender St", type: "Colocation", operator: "TELUS", mw: 18 },
          ]},
        ],
      },
      {
        name: "Quebec", count: 86, lat: 52.9399, lon: -73.5491,
        cities: [
          { name: "Montreal", count: 86, lat: 45.5017, lon: -73.5673, centers: [
            { name: "Cologix MTL1", zip: "H3C 2M1", address: "1 Robert-Bourassa Blvd", type: "Colocation", operator: "Cologix", mw: 15 },
            { name: "Bell Canada YUL1", zip: "H3B 1X9", address: "1000 De La Gauchetiere St", type: "Colocation", operator: "Bell Canada", mw: 12 },
          ]},
        ],
      },
    ],
  },
  AU: {
    name: "Australia", lat: -25.2744, lon: 133.7751, zoom: 3.5,
    states: [
      {
        name: "New South Wales", count: 130, lat: -31.2532, lon: 146.9211,
        cities: [
          { name: "Sydney", count: 130, lat: -33.8688, lon: 151.2093, centers: [
            { name: "Equinix SY1", zip: "2015", address: "47 Bourke Rd, Alexandria", type: "Colocation", operator: "Equinix", mw: 30 },
            { name: "Macquarie SY1", zip: "2113", address: "2 Broadcast Way, Artarmon", type: "Colocation", operator: "Macquarie", mw: 20 },
            { name: "NEXTDC S2", zip: "2113", address: "4 Eden Park Dr, Macquarie Park", type: "Colocation", operator: "NEXTDC", mw: 25 },
          ]},
        ],
      },
      {
        name: "Victoria", count: 100, lat: -36.9848, lon: 143.3906,
        cities: [
          { name: "Melbourne", count: 100, lat: -37.8136, lon: 144.9631, centers: [
            { name: "Equinix ME1", zip: "3000", address: "3 Lyon Park Rd, Macquarie Park", type: "Colocation", operator: "Equinix", mw: 25 },
            { name: "NEXTDC M2", zip: "3207", address: "820 Lorimer St, Port Melbourne", type: "Colocation", operator: "NEXTDC", mw: 20 },
          ]},
        ],
      },
      {
        name: "Queensland", count: 60, lat: -20.9176, lon: 142.7028,
        cities: [
          { name: "Brisbane", count: 60, lat: -27.4698, lon: 153.0251, centers: [
            { name: "NEXTDC B1", zip: "4101", address: "6 Brandl St, Eight Mile Plains", type: "Colocation", operator: "NEXTDC", mw: 15 },
            { name: "Equinix BN1", zip: "4101", address: "825 Coronation Dr", type: "Colocation", operator: "Equinix", mw: 10 },
          ]},
        ],
      },
    ],
  },
  NL: {
    name: "Netherlands", lat: 52.3, lon: 5.0, zoom: 30,
    states: [
      {
        name: "North Holland", count: 140, lat: 52.5198, lon: 4.7901,
        cities: [
          { name: "Amsterdam", count: 140, lat: 52.3676, lon: 4.9041, centers: [
            { name: "Equinix AM3", zip: "1101", address: "Kuiperbergweg 13", type: "Colocation", operator: "Equinix", mw: 40 },
            { name: "Digital Realty AMS", zip: "1102", address: "Gyroscoopweg 2a", type: "Colocation", operator: "Digital Realty", mw: 35 },
            { name: "NTT Amsterdam", zip: "1043", address: "Gyroscoopweg 2e", type: "Colocation", operator: "NTT", mw: 25 },
            { name: "Interxion AMS7", zip: "1115", address: "Cessnalaan 3", type: "Colocation", operator: "Interxion", mw: 30 },
            { name: "Nebius AI AMS1", zip: "1012", address: "Damrak 70", type: "AI", operator: "Nebius (Yandex)", mw: 70 },
          ]},
        ],
      },
      {
        name: "South Holland", count: 70, lat: 52.0705, lon: 4.3007,
        cities: [
          { name: "Rotterdam", count: 40, lat: 51.9225, lon: 4.4792, centers: [
            { name: "Interxion RTM1", zip: "3012", address: "Schaardijk 400", type: "Colocation", operator: "Interxion", mw: 12 },
          ]},
          { name: "The Hague", count: 30, lat: 52.0705, lon: 4.3007, centers: [
            { name: "SURFnet HAG1", zip: "2516", address: "Koningskade 4", type: "Government", operator: "SURFnet", mw: 8 },
          ]},
        ],
      },
    ],
  },
  JP: {
    name: "Japan", lat: 36.2048, lon: 138.2529, zoom: 7,
    states: [
      {
        name: "Tokyo", count: 130, lat: 35.6762, lon: 139.6503,
        cities: [
          { name: "Tokyo", count: 130, lat: 35.6762, lon: 139.6503, centers: [
            { name: "Equinix TY1", zip: "135-0063", address: "14-1 Toyosu, Koto-ku", type: "Colocation", operator: "Equinix", mw: 30 },
            { name: "Digital Realty TYO", zip: "100-0005", address: "3-1 Marunouchi, Chiyoda-ku", type: "Colocation", operator: "Digital Realty", mw: 25 },
            { name: "IDC Frontier TYO1", zip: "108-0075", address: "2-3-14 Konan, Minato-ku", type: "Colocation", operator: "IDC Frontier", mw: 20 },
            { name: "SoftBank AI Campus", zip: "105-7529", address: "1-9-1 Higashi-Shimbashi, Minato-ku", type: "AI", operator: "SoftBank", mw: 100 },
            { name: "KDDI Musashino AI", zip: "180-0012", address: "1-3 Ohara, Musashino-shi", type: "AI", operator: "KDDI", mw: 60 },
          ]},
        ],
      },
      {
        name: "Osaka", count: 50, lat: 34.6937, lon: 135.5023,
        cities: [
          { name: "Osaka", count: 50, lat: 34.6937, lon: 135.5023, centers: [
            { name: "Equinix OS1", zip: "530-0011", address: "1-8-14 Sonezakishinchi, Kita-ku", type: "Colocation", operator: "Equinix", mw: 15 },
            { name: "Telehouse Osaka", zip: "532-0003", address: "3-11-66 Itachibori, Nishi-ku", type: "Colocation", operator: "Telehouse", mw: 12 },
          ]},
        ],
      },
      {
        name: "Hokkaido", count: 25, lat: 43.0642, lon: 141.3469,
        cities: [
          { name: "Sapporo", count: 25, lat: 43.0642, lon: 141.3469, centers: [
            { name: "NTT Sapporo DC1", zip: "060-0001", address: "1 Kita 1-jo Nishi", type: "Colocation", operator: "NTT", mw: 8 },
          ]},
        ],
      },
    ],
  },
  RU: {
    name: "Russia", lat: 61.524, lon: 80.0, zoom: 3,
    states: [
      {
        name: "Moscow Oblast", count: 110, lat: 55.7558, lon: 37.6176,
        cities: [
          { name: "Moscow", count: 110, lat: 55.7558, lon: 37.6176, centers: [
            { name: "DataLine MOW1", zip: "127273", address: "2nd Khutorskaya St, Otradnoye", type: "Colocation", operator: "DataLine", mw: 30 },
            { name: "Rostelecom MSK1", zip: "105062", address: "Bolshaya Kommunisticheskaya 17", type: "Colocation", operator: "Rostelecom", mw: 25 },
            { name: "IXcellerate MOW1", zip: "115193", address: "7th Kozhukhovskiy Proezd 15", type: "Colocation", operator: "IXcellerate", mw: 20 },
          ]},
        ],
      },
      {
        name: "Saint Petersburg", count: 50, lat: 59.9343, lon: 30.3351,
        cities: [
          { name: "Saint Petersburg", count: 50, lat: 59.9343, lon: 30.3351, centers: [
            { name: "DataLine SPB1", zip: "194100", address: "Novosibirskaya St 6", type: "Colocation", operator: "DataLine", mw: 15 },
          ]},
        ],
      },
      {
        name: "Siberia", count: 30, lat: 54.9884, lon: 82.9057,
        cities: [
          { name: "Novosibirsk", count: 30, lat: 54.9884, lon: 82.9057, centers: [
            { name: "Rostelecom NSK1", zip: "630099", address: "Lenina St 3", type: "Colocation", operator: "Rostelecom", mw: 8 },
          ]},
        ],
      },
    ],
  },
  BR: {
    name: "Brazil", lat: -14.235, lon: -51.9253, zoom: 3.5,
    states: [
      {
        name: "São Paulo", count: 120, lat: -23.5505, lon: -46.6333,
        cities: [
          { name: "São Paulo", count: 120, lat: -23.5505, lon: -46.6333, centers: [
            { name: "Equinix SP2", zip: "04795-100", address: "Av Dr Chucri Zaidan 1240", type: "Colocation", operator: "Equinix", mw: 30 },
            { name: "Ascenty SP1", zip: "06460-000", address: "Av Sagitário 138", type: "Colocation", operator: "Ascenty", mw: 25 },
            { name: "Digital Realty GRU", zip: "04311-906", address: "Av Roque Petroni Jr 999", type: "Colocation", operator: "Digital Realty", mw: 20 },
          ]},
        ],
      },
      {
        name: "Rio de Janeiro", count: 40, lat: -22.9068, lon: -43.1729,
        cities: [
          { name: "Rio de Janeiro", count: 40, lat: -22.9068, lon: -43.1729, centers: [
            { name: "Embratel RIO1", zip: "20040-900", address: "Av Presidente Wilson 231", type: "Colocation", operator: "Embratel", mw: 12 },
          ]},
        ],
      },
      {
        name: "Minas Gerais", count: 20, lat: -18.5122, lon: -44.555,
        cities: [
          { name: "Belo Horizonte", count: 20, lat: -19.9167, lon: -43.9345, centers: [
            { name: "HostDime BHZ1", zip: "30112-020", address: "Rua da Bahia 1681", type: "Colocation", operator: "HostDime", mw: 6 },
          ]},
        ],
      },
    ],
  },
  IN: {
    name: "India", lat: 20.5937, lon: 78.9629, zoom: 5,
    states: [
      {
        name: "Maharashtra", count: 65, lat: 19.7515, lon: 75.7139,
        cities: [
          { name: "Mumbai", count: 65, lat: 19.076, lon: 72.8777, centers: [
            { name: "Equinix MB1", zip: "400093", address: "Rabale MIDC, Navi Mumbai", type: "Colocation", operator: "Equinix", mw: 18 },
            { name: "Nxtra BOM1", zip: "400059", address: "SEEPZ, Andheri East", type: "Colocation", operator: "Nxtra", mw: 15 },
          ]},
        ],
      },
      {
        name: "Karnataka", count: 55, lat: 15.3173, lon: 75.7139,
        cities: [
          { name: "Bangalore", count: 55, lat: 12.9716, lon: 77.5946, centers: [
            { name: "Equinix BG1", zip: "560071", address: "EPIP Zone, Whitefield", type: "Colocation", operator: "Equinix", mw: 15 },
            { name: "CtrlS BLR1", zip: "560037", address: "KIADB Industrial Area", type: "Colocation", operator: "CtrlS", mw: 12 },
          ]},
        ],
      },
      {
        name: "Tamil Nadu", count: 35, lat: 11.1271, lon: 78.6569,
        cities: [
          { name: "Chennai", count: 35, lat: 13.0827, lon: 80.2707, centers: [
            { name: "Nxtra MAA1", zip: "600113", address: "SIPCOT IT Park, Siruseri", type: "Colocation", operator: "Nxtra", mw: 10 },
          ]},
        ],
      },
    ],
  },
  SG: {
    name: "Singapore", lat: 1.3521, lon: 103.8198, zoom: 80,
    states: [
      {
        name: "Central Region", count: 80, lat: 1.3521, lon: 103.8198,
        cities: [
          { name: "Singapore CBD", count: 50, lat: 1.28, lon: 103.8501, centers: [
            { name: "Equinix SG2", zip: "418926", address: "26A Ayer Rajah Crescent", type: "Colocation", operator: "Equinix", mw: 25 },
            { name: "Digital Realty SIN", zip: "627785", address: "29A International Business Park", type: "Colocation", operator: "Digital Realty", mw: 20 },
            { name: "CoreWeave SG1", zip: "138628", address: "1 Science Park Dr", type: "AI", operator: "CoreWeave", mw: 80 },
            { name: "Nvidia AI Singapore", zip: "117440", address: "138 Depot Rd", type: "AI", operator: "NVIDIA", mw: 50 },
          ]},
          { name: "Jurong", count: 30, lat: 1.3404, lon: 103.709, centers: [
            { name: "Keppel DC SG2", zip: "639798", address: "63 Science Park Rd", type: "Colocation", operator: "Keppel", mw: 15 },
          ]},
        ],
      },
      {
        name: "West Region", count: 50, lat: 1.3239, lon: 103.638,
        cities: [
          { name: "Tuas", count: 50, lat: 1.3239, lon: 103.638, centers: [
            { name: "ST Telemedia Tuas", zip: "638888", address: "Tuas Industrial Estate", type: "Hyperscale", operator: "ST Telemedia", mw: 50 },
            { name: "GIC HyperScale SG1", zip: "638520", address: "Pioneer Sector 1", type: "Hyperscale", operator: "GIC", mw: 100 },
          ]},
        ],
      },
    ],
  },
  SE: {
    name: "Sweden", lat: 62.0, lon: 16.0, zoom: 9,
    states: [
      {
        name: "Stockholm County", count: 80, lat: 59.3293, lon: 18.0686,
        cities: [
          { name: "Stockholm", count: 80, lat: 59.3293, lon: 18.0686, centers: [
            { name: "Equinix SK1", zip: "115 23", address: "Hammarby Sjostad", type: "Colocation", operator: "Equinix", mw: 20 },
            { name: "Interxion STO1", zip: "102 12", address: "Esbogatan 11", type: "Colocation", operator: "Interxion", mw: 18 },
          ]},
        ],
      },
      {
        name: "Norrbotten", count: 35, lat: 66.8309, lon: 20.3971,
        cities: [
          { name: "Luleå", count: 35, lat: 65.5848, lon: 22.1547, centers: [
            { name: "Meta Luleå RSC", zip: "971 25", address: "Gruvövägen 1", type: "AI", operator: "Meta", mw: 120 },
            { name: "Hydro66 LUL1", zip: "972 54", address: "Norra Hamn 1", type: "AI", operator: "Hydro66", mw: 60 },
          ]},
        ],
      },
    ],
  },
  KR: {
    name: "South Korea", lat: 36.5, lon: 127.5, zoom: 14,
    states: [
      {
        name: "Seoul Capital Area", count: 90, lat: 37.5665, lon: 126.978,
        cities: [
          { name: "Seoul", count: 90, lat: 37.5665, lon: 126.978, centers: [
            { name: "Equinix SE1", zip: "04524", address: "LG U+ Bldg, Mapo-gu", type: "Colocation", operator: "Equinix", mw: 20 },
            { name: "KT IDC Seoul", zip: "05854", address: "Gasan Digital Complex", type: "Colocation", operator: "KT Corp", mw: 25 },
            { name: "LG CNS Seoul", zip: "07326", address: "Magok-dong, Gangseo-gu", type: "Colocation", operator: "LG CNS", mw: 18 },
          ]},
        ],
      },
      {
        name: "Gyeonggi-do", count: 20, lat: 37.4138, lon: 127.5183,
        cities: [
          { name: "Seongnam", count: 20, lat: 37.4449, lon: 127.1388, centers: [
            { name: "Kakao Seongnam DC1", zip: "13529", address: "Pangyo-ro 242", type: "Hyperscale", operator: "Kakao", mw: 30 },
          ]},
        ],
      },
    ],
  },
  AE: {
    name: "UAE", lat: 24.0, lon: 54.0, zoom: 22,
    states: [
      {
        name: "Dubai", count: 60, lat: 25.2048, lon: 55.2708,
        cities: [
          { name: "Dubai", count: 60, lat: 25.2048, lon: 55.2708, centers: [
            { name: "Equinix DX1", zip: "000001", address: "Dubai Internet City", type: "Colocation", operator: "Equinix", mw: 20 },
            { name: "du DXB1", zip: "000002", address: "Jebel Ali Free Zone", type: "Colocation", operator: "du", mw: 15 },
            { name: "Khazna DXB1", zip: "000003", address: "Dubai Silicon Oasis", type: "Colocation", operator: "Khazna", mw: 12 },
          ]},
        ],
      },
      {
        name: "Abu Dhabi", count: 35, lat: 24.4539, lon: 54.3773,
        cities: [
          { name: "Abu Dhabi", count: 35, lat: 24.4539, lon: 54.3773, centers: [
            { name: "Mubadala AUH1", zip: "000010", address: "Masdar City", type: "Government", operator: "Mubadala", mw: 25 },
            { name: "Khazna AUH1", zip: "000011", address: "ICAD II", type: "Colocation", operator: "Khazna", mw: 18 },
          ]},
        ],
      },
    ],
  },
  CH: {
    name: "Switzerland", lat: 46.8182, lon: 8.2275, zoom: 28,
    states: [
      {
        name: "Geneva Canton", count: 45, lat: 46.2044, lon: 6.1432,
        cities: [
          { name: "Geneva", count: 45, lat: 46.2044, lon: 6.1432, centers: [
            { name: "Equinix GV1", zip: "1218", address: "18 Av. Louis-Casai", type: "Colocation", operator: "Equinix", mw: 12 },
            { name: "Interxion GVA1", zip: "1228", address: "30 Rue des Acacias", type: "Colocation", operator: "Interxion", mw: 10 },
          ]},
        ],
      },
      {
        name: "Zürich Canton", count: 43, lat: 47.3769, lon: 8.5417,
        cities: [
          { name: "Zürich", count: 43, lat: 47.3769, lon: 8.5417, centers: [
            { name: "Equinix ZH1", zip: "8005", address: "Industriestrasse 18", type: "Colocation", operator: "Equinix", mw: 15 },
            { name: "Google ZRH1", zip: "8002", address: "Brandschenkestrasse 110", type: "Hyperscale", operator: "Google", mw: 50 },
          ]},
        ],
      },
    ],
  },
  MX: {
    name: "Mexico", lat: 23.6345, lon: -102.5528, zoom: 7,
    states: [
      {
        name: "Mexico City", count: 60, lat: 19.4326, lon: -99.1332,
        cities: [
          { name: "Mexico City", count: 60, lat: 19.4326, lon: -99.1332, centers: [
            { name: "Equinix MX1", zip: "06600", address: "Avenida Juárez 76", type: "Colocation", operator: "Equinix", mw: 15 },
            { name: "KIO Networks MEX1", zip: "04530", address: "Miguel de Cervantes Saavedra 255", type: "Colocation", operator: "KIO Networks", mw: 20 },
          ]},
        ],
      },
      {
        name: "Nuevo León", count: 25, lat: 25.6866, lon: -100.3161,
        cities: [
          { name: "Monterrey", count: 25, lat: 25.6866, lon: -100.3161, centers: [
            { name: "Telmex MTY1", zip: "64000", address: "Washington 2000 Nte", type: "Colocation", operator: "Telmex", mw: 8 },
          ]},
        ],
      },
    ],
  },
  PL: {
    name: "Poland", lat: 51.9194, lon: 19.1451, zoom: 16,
    states: [
      {
        name: "Masovian Voivodeship", count: 50, lat: 52.2297, lon: 21.0122,
        cities: [
          { name: "Warsaw", count: 50, lat: 52.2297, lon: 21.0122, centers: [
            { name: "Equinix WA1", zip: "02-222", address: "Al. Jerozolimskie 160", type: "Colocation", operator: "Equinix", mw: 12 },
            { name: "Atman WAW1", zip: "01-217", address: "Grochowska 316", type: "Colocation", operator: "Atman", mw: 10 },
          ]},
        ],
      },
      {
        name: "Lower Silesia", count: 25, lat: 51.1079, lon: 17.0385,
        cities: [
          { name: "Wrocław", count: 25, lat: 51.1079, lon: 17.0385, centers: [
            { name: "Equinix WR1", zip: "50-203", address: "Fabryczna 6", type: "Colocation", operator: "Equinix", mw: 8 },
          ]},
        ],
      },
    ],
  },
  ZA: {
    name: "South Africa", lat: -28.5, lon: 25.0, zoom: 7,
    states: [
      {
        name: "Gauteng", count: 45, lat: -26.2041, lon: 28.0473,
        cities: [
          { name: "Johannesburg", count: 35, lat: -26.2041, lon: 28.0473, centers: [
            { name: "Teraco JHB1", zip: "1685", address: "7 Kikuyu Rd, Sunninghill", type: "Colocation", operator: "Teraco", mw: 12 },
            { name: "Dimension Data JHB1", zip: "2062", address: "177 Rivonia Rd", type: "Colocation", operator: "Dimension Data", mw: 8 },
          ]},
          { name: "Pretoria", count: 10, lat: -25.7479, lon: 28.2293, centers: [
            { name: "Teraco PTA1", zip: "0002", address: "459 Church St", type: "Government", operator: "Teraco", mw: 5 },
          ]},
        ],
      },
      {
        name: "Western Cape", count: 15, lat: -33.9249, lon: 18.4241,
        cities: [
          { name: "Cape Town", count: 15, lat: -33.9249, lon: 18.4241, centers: [
            { name: "Teraco CPT1", zip: "8001", address: "158 Jan Smuts Ave", type: "Colocation", operator: "Teraco", mw: 5 },
          ]},
        ],
      },
    ],
  },
};

const TYPE_COLOR = {
  Colocation: "#6366f1",
  Hyperscale: "#f59e0b",
  Government: "#10b981",
  Neocloud: "#ec4899",
  AI: "#06b6d4",
};

const AI_TYPES = new Set(["AI"]);
const isAI = (dc) => AI_TYPES.has(dc.type);

const worldSizeScale = d3.scaleSqrt().domain([60, 4184]).range([5, 34]);
const stateSizeScale = d3.scaleSqrt().domain([10, 900]).range([6, 22]);
const citySizeScale = d3.scaleSqrt().domain([10, 450]).range([5, 16]);

export default function GeoMap() {
  const svgRef = useRef();
  const gRef = useRef();
  const projRef = useRef();
  const pathRef = useRef();
  const zoomRef = useRef();

  const [world, setWorld] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState(null);
  const [level, setLevel] = useState("world");
  const [selected, setSelected] = useState({});
  const [cityDCs, setCityDCs] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([{ label: "World", level: "world", selected: {} }]);
  const [dcFilter, setDcFilter] = useState("all"); // "all" | "ai" | "traditional"

  // ── Fetch world TopoJSON ──────────────────────────────────────────────────
  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(r => r.json())
      .then(data => { setWorld(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // ── Initialize SVG, projection, zoom, base geography ─────────────────────
  useEffect(() => {
    if (!world || !svgRef.current) return;
    const width = svgRef.current.clientWidth || 800;
    const height = 420;

    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height);
    svg.selectAll("*").remove();

    const projection = d3.geoNaturalEarth1()
      .scale(width / 6.5)
      .translate([width / 2, height / 2]);
    projRef.current = projection;
    pathRef.current = d3.geoPath().projection(projection);

    const zoom = d3.zoom()
      .scaleExtent([1, 500])
      .on("zoom", event => {
        d3.select(gRef.current).attr("transform", event.transform);
        const k = event.transform.k;
        // Keep marker sizes constant in screen space
        svg.selectAll(".drill-bubble").each(function () {
          const r = +d3.select(this).attr("data-r");
          d3.select(this).attr("r", r / k);
        });
        svg.selectAll(".drill-pulse").each(function () {
          const r = +d3.select(this).attr("data-r");
          d3.select(this).attr("r", (r + 6) / k);
        });
        svg.selectAll(".city-label").attr("font-size", `${11 / k}px`);
        svg.selectAll(".dc-pin-ring").each(function () {
          d3.select(this).attr("r", 5 / k);
        });
        svg.selectAll(".dc-pin-dot").each(function () {
          d3.select(this).attr("r", 2.5 / k);
        });
      });
    zoomRef.current = zoom;
    svg.call(zoom);

    const g = svg.append("g");
    gRef.current = g.node();

    // Graticule
    g.append("path")
      .datum(d3.geoGraticule()())
      .attr("d", pathRef.current)
      .attr("fill", "none")
      .attr("stroke", "#0f172a")
      .attr("stroke-width", 0.3);

    // Countries fill
    const countries = topojson.feature(world, world.objects.countries);
    g.append("g")
      .attr("id", "countries-layer")
      .selectAll("path")
      .data(countries.features)
      .join("path")
      .attr("d", pathRef.current)
      .attr("fill", "#1e293b")
      .attr("stroke", "#334155")
      .attr("stroke-width", 0.5);

    // Markers group (rebuilt on each drill)
    g.append("g").attr("id", "markers");
  }, [world]);

  // ── Re-render markers whenever level/selected changes ────────────────────
  useEffect(() => {
    if (!world || !svgRef.current || !projRef.current) return;
    const svg = d3.select(svgRef.current);
    const markers = svg.select("#markers");
    markers.selectAll("*").remove();
    setTooltip(null);

    if (level === "world") {
      svg.transition().duration(750).call(
        zoomRef.current.transform, d3.zoomIdentity
      );
      drawWorldBubbles(markers);
      setCityDCs(null);
    } else if (level === "country") {
      const country = DC_HIERARCHY[selected.country];
      if (!country) return;
      zoomTo(country.lat, country.lon, country.zoom, svg);
      drawStateBubbles(markers, country);
      setCityDCs(null);
    } else if (level === "state") {
      const country = DC_HIERARCHY[selected.country];
      const state = country?.states.find(s => s.name === selected.state);
      if (!state) return;
      zoomTo(state.lat, state.lon, country.zoom * 4, svg);
      drawCityPins(markers, state, null, dcFilter);
      setCityDCs(null);
    } else if (level === "city") {
      const country = DC_HIERARCHY[selected.country];
      const state = country?.states.find(s => s.name === selected.state);
      const city = state?.cities.find(c => c.name === selected.city);
      if (!city) return;
      zoomTo(city.lat, city.lon, country.zoom * 12, svg);
      drawCityPins(markers, state, city.name, dcFilter);
      setCityDCs(city);
    }
  }, [level, selected, world, dcFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const zoomTo = (lat, lon, scale, svg) => {
    const proj = projRef.current;
    const el = svgRef.current;
    const w = el ? el.clientWidth || 800 : 800;
    const h = 420;
    const [px, py] = proj([lon, lat]) || [w / 2, h / 2];
    svg.transition().duration(800).call(
      zoomRef.current.transform,
      d3.zoomIdentity
        .translate(w / 2 - scale * px, h / 2 - scale * py)
        .scale(scale)
    );
  };

  const drillDown = (newLevel, newSelected) => {
    setLevel(newLevel);
    setSelected(newSelected);
    setBreadcrumbs(prev => {
      const base = [{ label: "World", level: "world", selected: {} }];
      const crumbs = [...base];
      if (newSelected.country) {
        const c = DC_HIERARCHY[newSelected.country];
        crumbs.push({ label: c?.name || newSelected.country, level: "country", selected: { country: newSelected.country } });
      }
      if (newSelected.state) {
        crumbs.push({ label: newSelected.state, level: "state", selected: { country: newSelected.country, state: newSelected.state } });
      }
      if (newSelected.city) {
        crumbs.push({ label: newSelected.city, level: "city", selected: newSelected });
      }
      return crumbs;
    });
  };

  // ── Draw helpers ──────────────────────────────────────────────────────────
  const drawWorldBubbles = (g) => {
    const proj = projRef.current;
    const sorted = [...DC_DATA].sort((a, b) => b.count - a.count);

    // Pulse rings for top countries
    sorted.filter(d => d.count > 300).forEach(d => {
      const [cx, cy] = proj([d.lon, d.lat]) || [0, 0];
      const r = worldSizeScale(d.count);
      const ring = g.append("circle")
        .attr("class", "drill-pulse")
        .attr("cx", cx).attr("cy", cy)
        .attr("r", r + 6).attr("data-r", r)
        .attr("fill", "none")
        .attr("stroke", "#6366f1").attr("stroke-width", 1.5)
        .attr("opacity", 0.5);
      const pulse = () => {
        ring.attr("opacity", 0.5).attr("r", r + 6)
          .transition().duration(1600).ease(d3.easeSinInOut)
          .attr("r", r + 14).attr("opacity", 0)
          .on("end", pulse);
      };
      pulse();
    });

    // Bubbles
    g.selectAll(".world-bubble")
      .data(sorted)
      .join("circle")
      .attr("class", "world-bubble drill-bubble")
      .attr("cx", d => proj([d.lon, d.lat])?.[0] || 0)
      .attr("cy", d => proj([d.lon, d.lat])?.[1] || 0)
      .attr("r", d => worldSizeScale(d.count))
      .attr("data-r", d => worldSizeScale(d.count))
      .attr("fill", "#6366f1").attr("fill-opacity", 0.75)
      .attr("stroke", "#a78bfa").attr("stroke-width", 1)
      .style("cursor", DC_HIERARCHY[d => d.code] ? "pointer" : "default")
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget).attr("fill-opacity", 1).attr("stroke-width", 2);
        setTooltip({
          x: event.offsetX, y: event.offsetY,
          title: d.country,
          sub: `${d.count.toLocaleString()} data centers`,
          hint: DC_HIERARCHY[d.code] ? "Click to explore regions" : null,
        });
      })
      .on("mousemove", event => setTooltip(t => t ? { ...t, x: event.offsetX, y: event.offsetY } : null))
      .on("mouseout", event => {
        d3.select(event.currentTarget).attr("fill-opacity", 0.75).attr("stroke-width", 1);
        setTooltip(null);
      })
      .on("click", (_, d) => {
        if (!DC_HIERARCHY[d.code]) return;
        drillDown("country", { country: d.code });
      });
  };

  const drawStateBubbles = (g, country) => {
    const proj = projRef.current;
    const maxCount = Math.max(...country.states.map(s => s.count));
    const scale = d3.scaleSqrt().domain([0, maxCount]).range([6, 22]);

    country.states.forEach(state => {
      const [cx, cy] = proj([state.lon, state.lat]) || [0, 0];
      const r = scale(state.count);

      g.append("circle")
        .attr("class", "drill-bubble")
        .attr("cx", cx).attr("cy", cy)
        .attr("r", r).attr("data-r", r)
        .attr("fill", "#818cf8").attr("fill-opacity", 0.8)
        .attr("stroke", "#c7d2fe").attr("stroke-width", 1)
        .style("cursor", "pointer")
        .on("mouseover", (event) => {
          d3.select(event.currentTarget).attr("fill-opacity", 1).attr("stroke-width", 2);
          setTooltip({
            x: event.offsetX, y: event.offsetY,
            title: state.name,
            sub: `${state.count.toLocaleString()} data centers`,
            hint: "Click to explore cities",
          });
        })
        .on("mousemove", event => setTooltip(t => t ? { ...t, x: event.offsetX, y: event.offsetY } : null))
        .on("mouseout", event => {
          d3.select(event.currentTarget).attr("fill-opacity", 0.8).attr("stroke-width", 1);
          setTooltip(null);
        })
        .on("click", () => drillDown("state", { country: selected.country, state: state.name }));

      g.append("text")
        .attr("class", "city-label")
        .attr("x", cx).attr("y", cy - r - 3)
        .attr("text-anchor", "middle")
        .attr("fill", "#e2e8f0")
        .attr("font-size", "11px")
        .attr("pointer-events", "none")
        .text(state.name);
    });
  };

  const drawCityPins = (g, state, highlightCity, filter = "all") => {
    const proj = projRef.current;

    state.cities.forEach(city => {
      const [cx, cy] = proj([city.lon, city.lat]) || [0, 0];
      const r = citySizeScale(city.count);
      const isHighlighted = highlightCity === city.name;
      const color = isHighlighted ? "#f59e0b" : "#34d399";

      g.append("circle")
        .attr("class", "drill-bubble")
        .attr("cx", cx).attr("cy", cy)
        .attr("r", r).attr("data-r", r)
        .attr("fill", color).attr("fill-opacity", isHighlighted ? 1 : 0.8)
        .attr("stroke", isHighlighted ? "#fcd34d" : "#6ee7b7").attr("stroke-width", 1.5)
        .style("cursor", "pointer")
        .on("mouseover", (event) => {
          d3.select(event.currentTarget).attr("fill-opacity", 1).attr("stroke-width", 2.5);
          setTooltip({
            x: event.offsetX, y: event.offsetY,
            title: city.name,
            sub: `${city.count} data centers`,
            hint: "Click to see individual facilities",
          });
        })
        .on("mousemove", event => setTooltip(t => t ? { ...t, x: event.offsetX, y: event.offsetY } : null))
        .on("mouseout", event => {
          d3.select(event.currentTarget).attr("fill-opacity", isHighlighted ? 1 : 0.8).attr("stroke-width", 1.5);
          setTooltip(null);
        })
        .on("click", () => drillDown("city", { country: selected.country, state: state.name, city: city.name }));

      // Individual DC pins if city is highlighted
      if (isHighlighted) {
        const visibleCenters = city.centers.filter(dc =>
          filter === "all" ? true : filter === "ai" ? isAI(dc) : !isAI(dc)
        );
        visibleCenters.forEach((dc, i) => {
          const angle = (i / visibleCenters.length) * 2 * Math.PI - Math.PI / 2;
          const dist = 18;
          const px2 = cx + Math.cos(angle) * dist;
          const py2 = cy + Math.sin(angle) * dist;
          const dcColor = TYPE_COLOR[dc.type] || "#6366f1";

          g.append("line")
            .attr("x1", cx).attr("y1", cy)
            .attr("x2", px2).attr("y2", py2)
            .attr("stroke", "#475569").attr("stroke-width", 0.8)
            .attr("pointer-events", "none");

          g.append("circle")
            .attr("class", "dc-pin-ring")
            .attr("cx", px2).attr("cy", py2)
            .attr("r", 5).attr("fill", dcColor)
            .attr("fill-opacity", 0.9)
            .attr("stroke", "#f8fafc").attr("stroke-width", 1)
            .style("cursor", "default")
            .on("mouseover", event => setTooltip({
              x: event.offsetX, y: event.offsetY,
              title: dc.name,
              sub: `${dc.type} · ${dc.mw}MW`,
              hint: `ZIP: ${dc.zip}`,
            }))
            .on("mousemove", event => setTooltip(t => t ? { ...t, x: event.offsetX, y: event.offsetY } : null))
            .on("mouseout", () => setTooltip(null));

          g.append("circle")
            .attr("class", "dc-pin-dot")
            .attr("cx", px2).attr("cy", py2)
            .attr("r", 2.5).attr("fill", "#f8fafc")
            .attr("pointer-events", "none");
        });
      }

      g.append("text")
        .attr("class", "city-label")
        .attr("x", cx).attr("y", cy - r - 3)
        .attr("text-anchor", "middle")
        .attr("fill", isHighlighted ? "#fcd34d" : "#d1fae5")
        .attr("font-size", "11px")
        .attr("font-weight", isHighlighted ? "bold" : "normal")
        .attr("pointer-events", "none")
        .text(city.name);
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const countryData = selected.country ? DC_HIERARCHY[selected.country] : null;
  const stateData = countryData?.states.find(s => s.name === selected.state);

  return (
    <div className="space-y-4">
      {/* Map card */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
          <div>
            <div className="text-xs text-indigo-400 font-medium tracking-wide">
              GLOBAL DATA CENTER MAP · DRILL-DOWN
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {level === "world" && "Click a bubble to explore regions"}
              {level === "country" && `${countryData?.name} — click a region to explore cities`}
              {level === "state" && `${selected.state} — click a city to see facilities`}
              {level === "city" && `${selected.city} — individual data centers`}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {/* Filter toggle */}
            <div className="flex rounded-lg overflow-hidden border border-gray-700 text-xs">
              {[["all", "All"], ["ai", "AI Only"], ["traditional", "Traditional"]].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setDcFilter(val)}
                  className={`px-2.5 py-1 transition-colors ${dcFilter === val ? "bg-indigo-600 text-white" : "bg-gray-900 text-gray-400 hover:text-gray-200"}`}
                >
                  {val === "ai" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1" />}
                  {label}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="flex gap-3 text-xs text-gray-400 flex-wrap justify-end">
              {level === "world" && (
                <>
                  <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-indigo-500 opacity-90" /> 1000+</span>
                  <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-indigo-500 opacity-70" /> 100–999</span>
                  <span className="flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-50" /> &lt;100</span>
                </>
              )}
              {(level === "state" || level === "city") && (
                <>
                  <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-emerald-400" /> City</span>
                  {level === "city" && Object.entries(TYPE_COLOR).map(([t, c]) => (
                    <span key={t} className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ background: c }} /> {t}
                    </span>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-1 text-xs mb-2 flex-wrap">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-gray-600">›</span>}
              {i < breadcrumbs.length - 1 ? (
                <button
                  onClick={() => { setLevel(crumb.level); setSelected(crumb.selected); setBreadcrumbs(breadcrumbs.slice(0, i + 1)); }}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="text-gray-300 font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </div>

        {/* SVG */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: 420 }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
              Loading map…
            </div>
          )}
          <svg ref={svgRef} width="100%" height="420" />

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute pointer-events-none bg-gray-900/95 border border-indigo-500/60 rounded-lg px-3 py-2 text-xs shadow-xl z-10 min-w-[140px]"
              style={{ left: tooltip.x + 14, top: tooltip.y - 14 }}
            >
              <div className="font-semibold text-white mb-0.5">{tooltip.title}</div>
              <div className="text-indigo-300">{tooltip.sub}</div>
              {tooltip.hint && <div className="text-gray-500 mt-1 italic">{tooltip.hint}</div>}
            </div>
          )}
        </div>
      </div>

      {/* City-level DC cards */}
      {level === "city" && cityDCs && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="text-xs text-indigo-400 font-medium tracking-wide">
              {cityDCs.name.toUpperCase()} · {cityDCs.centers.filter(dc =>
                dcFilter === "all" ? true : dcFilter === "ai" ? isAI(dc) : !isAI(dc)
              ).length} FACILITIES
              {dcFilter !== "all" && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-normal"
                  style={{ background: dcFilter === "ai" ? "#06b6d420" : "#6366f120", color: dcFilter === "ai" ? "#06b6d4" : "#818cf8" }}>
                  {dcFilter === "ai" ? "AI Only" : "Traditional Only"}
                </span>
              )}
            </div>
            <div className="flex gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400" />
                {cityDCs.centers.filter(isAI).length} AI
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-500" />
                {cityDCs.centers.filter(dc => !isAI(dc)).length} Traditional
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cityDCs.centers.filter(dc =>
              dcFilter === "all" ? true : dcFilter === "ai" ? isAI(dc) : !isAI(dc)
            ).map((dc, i) => (
              <div key={i} className="bg-gray-900 border border-gray-700 rounded-lg p-3 hover:border-indigo-600 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="text-sm font-semibold text-white leading-tight">{dc.name}</div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: `${TYPE_COLOR[dc.type]}22`, color: TYPE_COLOR[dc.type], border: `1px solid ${TYPE_COLOR[dc.type]}44` }}
                  >
                    {dc.type}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-600">ZIP</span>
                    <span className="text-gray-300 font-mono">{dc.zip}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-gray-600 shrink-0">ADDR</span>
                    <span className="text-gray-300">{dc.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-600">OPR</span>
                    <span className="text-gray-300">{dc.operator}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-600">CAP</span>
                    <span className="font-semibold" style={{ color: TYPE_COLOR[dc.type] }}>{dc.mw} MW</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* League table — only at world level */}
      {level === "world" && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="text-xs text-indigo-400 font-medium mb-3 tracking-wide">TOP 20 COUNTRIES RANKED</div>
          <div className="space-y-2">
            {[...DC_DATA].sort((a, b) => b.count - a.count).map((d, i) => (
              <div
                key={d.code}
                className={`flex items-center gap-3 ${DC_HIERARCHY[d.code] ? "cursor-pointer hover:opacity-80" : ""}`}
                onClick={() => DC_HIERARCHY[d.code] && drillDown("country", { country: d.code })}
              >
                <div className="text-xs text-gray-500 w-5 text-right">{i + 1}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-gray-300">{d.country}</span>
                    <span className="text-indigo-400 font-medium">{d.count.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full">
                    <div className="h-1.5 rounded-full bg-indigo-500 transition-all" style={{ width: `${(d.count / 4184) * 100}%` }} />
                  </div>
                </div>
                {DC_HIERARCHY[d.code] && (
                  <span className="text-indigo-500 text-xs">›</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* State-level summary */}
      {level === "country" && countryData && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="text-xs text-indigo-400 font-medium mb-3 tracking-wide">
            {countryData.name.toUpperCase()} · REGIONS
          </div>
          <div className="space-y-2">
            {[...countryData.states].sort((a, b) => b.count - a.count).map((state, i) => (
              <div
                key={i}
                className="flex items-center gap-3 cursor-pointer hover:opacity-80"
                onClick={() => drillDown("state", { country: selected.country, state: state.name })}
              >
                <div className="text-xs text-gray-500 w-5 text-right">{i + 1}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-gray-300">{state.name}</span>
                    <span className="text-indigo-400 font-medium">{state.count.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full">
                    <div className="h-1.5 rounded-full bg-violet-500 transition-all"
                      style={{ width: `${(state.count / countryData.states[0]?.count || 1) * 100}%` }} />
                  </div>
                </div>
                <span className="text-indigo-500 text-xs">›</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* City-level summary */}
      {level === "state" && stateData && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="text-xs text-indigo-400 font-medium mb-3 tracking-wide">
            {stateData.name.toUpperCase()} · CITIES
          </div>
          <div className="space-y-2">
            {[...stateData.cities].sort((a, b) => b.count - a.count).map((city, i) => (
              <div
                key={i}
                className="flex items-center gap-3 cursor-pointer hover:opacity-80"
                onClick={() => drillDown("city", { country: selected.country, state: stateData.name, city: city.name })}
              >
                <div className="text-xs text-gray-500 w-5 text-right">{i + 1}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-gray-300">{city.name}</span>
                    <span className="text-emerald-400 font-medium">{city.count.toLocaleString()} DCs</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full">
                    <div className="h-1.5 rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${(city.count / stateData.cities[0]?.count || 1) * 100}%` }} />
                  </div>
                </div>
                <span className="text-indigo-500 text-xs">›</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
