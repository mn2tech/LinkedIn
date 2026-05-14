import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

const DC_DATA = [
  { country: "United States", code: "US", count: 4184, lat: 39.5, lon: -98.35, color: "#6366f1" },
  { country: "United Kingdom", code: "GB", count: 515, lat: 55.3781, lon: -3.4360, color: "#8b5cf6" },
  { country: "Germany", code: "DE", count: 514, lat: 51.1657, lon: 10.4515, color: "#8b5cf6" },
  { country: "China", code: "CN", count: 368, lat: 35.8617, lon: 104.1954, color: "#a78bfa" },
  { country: "France", code: "FR", count: 344, lat: 46.2276, lon: 2.2137, color: "#a78bfa" },
  { country: "Canada", code: "CA", count: 336, lat: 56.1304, lon: -106.3468, color: "#a78bfa" },
  { country: "Australia", code: "AU", count: 290, lat: -25.2744, lon: 133.7751, color: "#c4b5fd" },
  { country: "Netherlands", code: "NL", count: 210, lat: 52.1326, lon: 5.2913, color: "#c4b5fd" },
  { country: "Japan", code: "JP", count: 205, lat: 36.2048, lon: 138.2529, color: "#c4b5fd" },
  { country: "Russia", code: "RU", count: 190, lat: 61.5240, lon: 105.3188, color: "#c4b5fd" },
  { country: "Brazil", code: "BR", count: 180, lat: -14.2350, lon: -51.9253, color: "#ddd6fe" },
  { country: "India", code: "IN", count: 155, lat: 20.5937, lon: 78.9629, color: "#ddd6fe" },
  { country: "Singapore", code: "SG", count: 130, lat: 1.3521, lon: 103.8198, color: "#ddd6fe" },
  { country: "Sweden", code: "SE", count: 115, lat: 60.1282, lon: 18.6435, color: "#ddd6fe" },
  { country: "South Korea", code: "KR", count: 110, lat: 35.9078, lon: 127.7669, color: "#ede9fe" },
  { country: "UAE", code: "AE", count: 95, lat: 23.4241, lon: 53.8478, color: "#ede9fe" },
  { country: "Switzerland", code: "CH", count: 88, lat: 46.8182, lon: 8.2275, color: "#ede9fe" },
  { country: "Mexico", code: "MX", count: 85, lat: 23.6345, lon: -102.5528, color: "#ede9fe" },
  { country: "Poland", code: "PL", count: 75, lat: 51.9194, lon: 19.1451, color: "#ede9fe" },
  { country: "South Africa", code: "ZA", count: 60, lat: -30.5595, lon: 22.9375, color: "#ede9fe" },
];

const sizeScale = d3.scaleSqrt().domain([60, 4184]).range([4, 32]);

export default function GeoMap() {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [world, setWorld] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(r => r.json())
      .then(data => { setWorld(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!world || !svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth || 700;
    const height = 380;

    const projection = d3.geoNaturalEarth1()
      .scale(width / 6.5)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);
    const countries = topojson.feature(world, world.objects.countries);

    // Draw countries
    svg.append("g")
      .selectAll("path")
      .data(countries.features)
      .join("path")
      .attr("d", path)
      .attr("fill", "#1e293b")
      .attr("stroke", "#334155")
      .attr("stroke-width", 0.5);

    // Draw graticule
    svg.append("path")
      .datum(d3.geoGraticule()())
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#0f172a")
      .attr("stroke-width", 0.3);

    // Draw bubbles
    const bubbles = svg.append("g").selectAll("circle")
      .data(DC_DATA.sort((a, b) => b.count - a.count))
      .join("circle");

    bubbles
      .attr("cx", d => projection([d.lon, d.lat])?.[0] || 0)
      .attr("cy", d => projection([d.lon, d.lat])?.[1] || 0)
      .attr("r", d => sizeScale(d.count))
      .attr("fill", "#6366f1")
      .attr("fill-opacity", 0.7)
      .attr("stroke", "#a78bfa")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this).attr("fill-opacity", 1).attr("stroke-width", 2);
        setTooltip({ x: event.offsetX, y: event.offsetY, data: d });
      })
      .on("mousemove", function(event, d) {
        setTooltip({ x: event.offsetX, y: event.offsetY, data: d });
      })
      .on("mouseout", function() {
        d3.select(this).attr("fill-opacity", 0.7).attr("stroke-width", 1);
        setTooltip(null);
      });

    // Pulse animation on top 3
    svg.selectAll("circle.pulse")
      .data(DC_DATA.filter(d => d.count > 300))
      .join("circle")
      .attr("class", "pulse")
      .attr("cx", d => projection([d.lon, d.lat])?.[0] || 0)
      .attr("cy", d => projection([d.lon, d.lat])?.[1] || 0)
      .attr("r", d => sizeScale(d.count))
      .attr("fill", "none")
      .attr("stroke", "#6366f1")
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.6)
      .each(function(d) {
        d3.select(this)
          .transition()
          .duration(1500)
          .ease(d3.easeSinInOut)
          .attr("r", sizeScale(d.count) + 8)
          .attr("opacity", 0)
          .on("end", function repeat() {
            d3.select(this)
              .attr("r", sizeScale(d.count))
              .attr("opacity", 0.6)
              .transition()
              .duration(1500)
              .ease(d3.easeSinInOut)
              .attr("r", sizeScale(d.count) + 8)
              .attr("opacity", 0)
              .on("end", repeat);
          });
      });

  }, [world]);

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="text-xs text-indigo-400 font-medium">GLOBAL DATA CENTER MAP · 2026</div>
            <div className="text-xs text-gray-500 mt-0.5">Bubble size = number of data centers · Hover for details</div>
          </div>
          <div className="flex gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-indigo-500 opacity-90"></span> 1000+</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-indigo-500 opacity-70"></span> 100-999</span>
            <span className="flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-50"></span> &lt;100</span>
          </div>
        </div>
        <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: 380 }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
              Loading map...
            </div>
          )}
          <svg ref={svgRef} width="100%" height="380" />
          {tooltip && (
            <div
              className="absolute pointer-events-none bg-gray-900 border border-indigo-500 rounded-lg px-3 py-2 text-xs shadow-xl z-10"
              style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
            >
              <div className="font-semibold text-white">{tooltip.data.country}</div>
              <div className="text-indigo-400 text-base font-bold">{tooltip.data.count.toLocaleString()}</div>
              <div className="text-gray-400">data centers</div>
            </div>
          )}
        </div>
      </div>

      {/* League table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <div className="text-xs text-indigo-400 font-medium mb-3">TOP 20 COUNTRIES RANKED</div>
        <div className="space-y-2">
          {DC_DATA.sort((a, b) => b.count - a.count).map((d, i) => (
            <div key={d.code} className="flex items-center gap-3">
              <div className="text-xs text-gray-500 w-5 text-right">{i + 1}</div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-gray-300">{d.country}</span>
                  <span className="text-indigo-400 font-medium">{d.count.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full">
                  <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${(d.count / 4184) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
