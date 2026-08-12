import { useEffect, useMemo, useRef, useState } from "react";
import { Search, MapPin, Star, Ruler, X } from "lucide-react";
import DiscoveryResultCard from "../../components/leads/DiscoveryResultCard";
import { useNotifications } from "../../context/NotificationContext";
import leadDiscoveryService from "../../services/leadDiscoveryService";
import leadService from "../../services/leadService";

const QUICK_CATEGORIES = [
  "Restaurant",
  "Dentist",
  "Salon",
  "Gym",
  "Real Estate",
  "Clinic",
  "Hotel",
  "Cafe",
  "Retail Store",
  "Auto Repair",
];

function FilterChip({ label, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition whitespace-nowrap ${
        active
          ? "bg-[#d95d08] text-white border-[#d95d08]"
          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
      }`}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

export default function LeadDiscovery() {
  const { addNotification } = useNotifications();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [activeFilter, setActiveFilter] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);

  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  // Debounced supporting-word suggestions
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await leadDiscoveryService.suggest(query);
        setSuggestions(data);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const runSearch = async (overrideQuery) => {
    const q = overrideQuery ?? query;

    if (!q.trim() && !category.trim()) {
      return;
    }

    setShowSuggestions(false);
    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const data = await leadDiscoveryService.search({
        query: q,
        category,
        location,
      });

      setResults(data);
      setSelected([]);
      setVisibleCount(6);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Couldn't search Google Maps right now. Please try again."
      );

      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      runSearch();
    }
  };

  const toggleSelect = (placeId) => {
    setSelected((prev) =>
      prev.includes(placeId)
        ? prev.filter((x) => x !== placeId)
        : [...prev, placeId]
    );
  };

  const visibleResults = useMemo(
    () =>
      results.filter(
        (r) => !minRating || (r.rating || 0) >= minRating
      ),
    [results, minRating]
  );

  const displayedResults = useMemo(
    () => visibleResults.slice(0, visibleCount),
    [visibleResults, visibleCount]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(visibleResults.length / 6)
  );

  const currentPage = Math.min(
    Math.max(1, Math.ceil(visibleCount / 6)),
    totalPages
  );

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  const goToPage = (page) => {
    setVisibleCount(
      Math.min(page * 6, visibleResults.length)
    );
  };

  const handleImport = async () => {
    const toImport = results.filter((r) =>
      selected.includes(r.placeId)
    );

    setImporting(true);

    try {
      await Promise.all(
        toImport.map((r) =>
          leadService.createLead({
            businessName: r.name,
            category: r.category || "",
            phone: r.phone || "",
            email: "",
            website: r.website || "",
            address: r.address,
            status: "New",
            source: "Google Maps",
            googlePlaceId: r.placeId,
            googleMapsLink: r.mapsUrl || "",
          })
        )
      );

      // Mark imported results as duplicate
      setResults((prev) =>
        prev.map((r) =>
          selected.includes(r.placeId)
            ? { ...r, isDuplicate: true }
            : r
        )
      );

      addNotification(
        `${toImport.length} lead${
          toImport.length > 1 ? "s" : ""
        } imported from Google Maps.`
      );

      setSelected([]);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Import failed. Please try again."
      );
    } finally {
      setImporting(false);
    }
  };

  const clearFilters = () => {
    setLocation("");
    setMinRating(0);
    setActiveFilter(null);
  };

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      {/* Page Heading */}
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-2xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
          Google Maps Lead Finder
        </h1>
      </div>

      {/* Search Section */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 w-full">
        {/* Business Search */}
        <div className="relative flex-1 w-full min-w-0">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10"
          />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() =>
              suggestions.length > 0 &&
              setShowSuggestions(true)
            }
            placeholder="Search businesses..."
            className="w-full h-12 rounded-lg bg-slate-100 border border-transparent pl-10 pr-4 text-sm placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#d95d08] focus:ring-2 focus:ring-[#d95d08]/20 transition"
          />

          {showSuggestions && suggestions.length > 0 && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSuggestions(false)}
              />

              <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-lg border border-slate-200 shadow-lg z-20 overflow-hidden max-h-60 overflow-y-auto">
                {suggestions.map((s) => (
                  <button
                    key={s.placeId}
                    onClick={() => {
                      setQuery(s.description);
                      setShowSuggestions(false);
                      runSearch(s.description);
                    }}
                    className="w-full min-h-[44px] text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-orange-50 flex items-center gap-2 border-b border-slate-50 last:border-0"
                  >
                    <Search
                      size={13}
                      className="text-slate-400 shrink-0"
                    />
                    <span className="truncate">
                      {s.description}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Category Search */}
        <div className="relative flex-1 w-full min-w-0">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by category"
            className="w-full h-12 rounded-lg bg-slate-100 border border-transparent pl-10 pr-4 text-sm placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#d95d08] focus:ring-2 focus:ring-[#d95d08]/20 transition"
          />
        </div>

        {/* Search Button */}
        <button
          onClick={() => runSearch()}
          disabled={loading}
          className="w-full sm:w-auto sm:min-w-[110px] h-12 bg-[#d95d08] hover:bg-[#c45305] text-white text-sm font-bold px-6 rounded-lg transition disabled:opacity-60"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Category Quick Chips */}
      <div className="flex flex-wrap gap-2 mb-4 w-full">
        {QUICK_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCategory(c);
              runSearch(query || c);
            }}
            className={`text-xs font-semibold px-3.5 py-2 rounded-full transition whitespace-nowrap ${
              category === c
                ? "bg-[#d95d08] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Quick Filters */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 sm:px-5 py-3.5 flex flex-wrap items-center gap-2.5 mb-6 w-full">
        <span className="text-xs font-semibold text-slate-500 w-full sm:w-auto">
          Quick Filters:
        </span>

        <FilterChip
          label={location || "Location"}
          icon={MapPin}
          active={activeFilter === "location"}
          onClick={() =>
            setActiveFilter(
              activeFilter === "location"
                ? null
                : "location"
            )
          }
        />

        <FilterChip
          label={minRating ? `${minRating}+ Rating` : "Rating"}
          icon={Star}
          active={activeFilter === "rating"}
          onClick={() =>
            setActiveFilter(
              activeFilter === "rating"
                ? null
                : "rating"
            )
          }
        />

        <FilterChip
          label="Radius"
          icon={Ruler}
          active={activeFilter === "radius"}
          onClick={() =>
            setActiveFilter(
              activeFilter === "radius"
                ? null
                : "radius"
            )
          }
        />

        <button
          onClick={clearFilters}
          className="sm:ml-auto flex items-center gap-1 text-xs font-bold text-[#d95d08] hover:text-[#c45305] px-2 py-2 whitespace-nowrap"
        >
          <X size={13} />
          Clear All
        </button>
      </div>

      {/* Location Filter */}
      {activeFilter === "location" && (
        <div className="mb-4 -mt-3 w-full">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Islamabad, Pakistan"
            className="w-full sm:w-72 h-11 rounded-lg border border-slate-200 px-3.5 text-sm outline-none focus:border-[#d95d08] focus:ring-2 focus:ring-[#d95d08]/20"
          />
        </div>
      )}

      {/* Rating Filter */}
      {activeFilter === "rating" && (
        <div className="mb-4 -mt-3 flex flex-wrap gap-2">
          {[3, 3.5, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={`text-xs font-bold px-3 py-2 rounded-full whitespace-nowrap ${
                minRating === r
                  ? "bg-[#d95d08] text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {r}+ ★
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 break-words">
          {error}
        </div>
      )}

      {/* Results */}
      {!hasSearched ? (
        <div className="text-center py-16 sm:py-20 px-4">
          <p className="text-sm sm:text-base font-semibold text-slate-500 leading-relaxed">
            Search for a business type and location to get started
          </p>

          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            e.g. "Aesthetic Clinics in Islamabad"
          </p>
        </div>
      ) : loading ? (
        <p className="text-sm text-slate-500 text-center py-10 px-4">
          Searching Google Maps...
        </p>
      ) : visibleResults.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-10 px-4">
          No results found. Try a different search.
        </p>
      ) : (
        <>
          {/* Result Cards */}
          <div className="w-full min-w-0">
            {displayedResults.map((result) => (
              <DiscoveryResultCard
                key={result.placeId}
                result={result}
                selected={selected.includes(result.placeId)}
                onToggle={toggleSelect}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`h-9 min-w-9 rounded-full px-3 text-sm font-semibold transition ${
                      currentPage === page
                        ? "bg-[#d95d08] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {visibleCount < visibleResults.length && (
                <button
                  onClick={() =>
                    setVisibleCount((prev) =>
                      Math.min(
                        prev + 6,
                        visibleResults.length
                      )
                    )
                  }
                  className="text-sm font-semibold text-[#d95d08] hover:text-[#c45305] px-2 py-2"
                >
                  Load more
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Import Selected */}
      {selected.length > 0 && (
        <div className="sticky bottom-4 flex justify-end mt-4 px-1">
          <button
            onClick={handleImport}
            disabled={importing}
            className="w-full sm:w-auto bg-[#d95d08] hover:bg-[#c45305] text-white text-sm font-bold px-6 py-3 rounded-lg shadow-lg transition disabled:opacity-60"
          >
            {importing
              ? "Importing..."
              : `Import Selected (${selected.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
