import React, { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Loader2, Download, Database, GitCompare, Shield, X, Filter, Hash, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

// ---------------------------------------------------------------------------
// Utility: detect whether a column's values are predominantly numeric
// ---------------------------------------------------------------------------
function isNumericColumn(rows, key) {
  if (rows.length === 0) return false;
  let numericCount = 0;
  let total = 0;
  for (const row of rows) {
    const v = row[key];
    if (v == null || v === "" || v === "-") continue;
    total++;
    if (!isNaN(Number(v))) numericCount++;
  }
  return total > 0 && numericCount / total > 0.8;
}

// ---------------------------------------------------------------------------
// Utility: compute column-level summary stats
// ---------------------------------------------------------------------------
function computeColumnStats(rows, columns) {
  const stats = {};
  for (const col of columns) {
    const values = rows.map((r) => r[col]).filter((v) => v != null && v !== "" && v !== "-");
    const numeric = isNumericColumn(rows, col);
    const distinctValues = new Set(values.map(String));

    if (numeric) {
      const nums = values.map(Number).filter((n) => !isNaN(n));
      stats[col] = {
        type: "numeric",
        count: values.length,
        distinct: distinctValues.size,
        sum: nums.reduce((a, b) => a + b, 0),
        min: Math.min(...nums),
        max: Math.max(...nums),
        avg: nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0,
      };
    } else {
      stats[col] = {
        type: "text",
        count: values.length,
        distinct: distinctValues.size,
      };
    }
  }
  return stats;
}

// ---------------------------------------------------------------------------
// Reusable: Filterable + sortable data table with export & stats
// ---------------------------------------------------------------------------
function DataTableWithFilters({ data, filename, title }) {
  const [columnFilters, setColumnFilters] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]);

  // Filter rows
  const filteredRows = useMemo(() => {
    let rows = data;

    // Column-level filters
    for (const [col, filterVal] of Object.entries(columnFilters)) {
      if (!filterVal) continue;
      const lower = filterVal.toLowerCase();
      rows = rows.filter((row) => {
        const val = row[col];
        if (val == null) return false;
        return String(val).toLowerCase().includes(lower);
      });
    }

    // Global filter
    if (globalFilter) {
      const lower = globalFilter.toLowerCase();
      rows = rows.filter((row) =>
        columns.some((col) => {
          const val = row[col];
          return val != null && String(val).toLowerCase().includes(lower);
        })
      );
    }

    return rows;
  }, [data, columnFilters, globalFilter, columns]);

  // Sort rows
  const sortedRows = useMemo(() => {
    if (!sortConfig.key) return filteredRows;
    const sorted = [...filteredRows].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Numeric comparison
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
      }

      // String comparison
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortConfig.direction === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [filteredRows, sortConfig]);

  // Column stats (computed on filtered data)
  const columnStats = useMemo(() => computeColumnStats(sortedRows, columns), [sortedRows, columns]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const setColumnFilter = (col, value) => {
    setColumnFilters((prev) => ({ ...prev, [col]: value }));
  };

  const clearAllFilters = () => {
    setColumnFilters({});
    setGlobalFilter("");
  };

  const activeFilterCount = Object.values(columnFilters).filter(Boolean).length + (globalFilter ? 1 : 0);

  const exportToCSV = () => {
    const headers = columns;
    const csv = [
      headers.join(","),
      ...sortedRows.map((row) =>
        headers.map((h) => JSON.stringify(row[h] != null ? String(row[h]) : "")).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search all columns..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>
            Showing <strong>{sortedRows.length}</strong> of <strong>{data.length}</strong> records
          </span>
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-1" />
          Column Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">{activeFilterCount}</Badge>
          )}
        </Button>
        <Button
          variant={showStats ? "default" : "outline"}
          size="sm"
          onClick={() => setShowStats(!showStats)}
        >
          <Hash className="h-4 w-4 mr-1" />
          Stats
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-1" />
          Export CSV ({sortedRows.length} rows)
        </Button>
      </div>

      {/* Column Stats Panel */}
      {showStats && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Column Statistics (filtered data)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {columns.map((col) => {
                const s = columnStats[col];
                if (!s) return null;
                return (
                  <div key={col} className="border rounded p-2 text-xs space-y-1">
                    <div className="font-semibold truncate" title={col}>{col}</div>
                    <div className="text-gray-500">
                      {s.count} values, {s.distinct} distinct
                    </div>
                    {s.type === "numeric" && (
                      <div className="text-gray-700 space-y-0.5">
                        <div>Sum: <strong>{s.sum.toLocaleString()}</strong></div>
                        <div>Avg: <strong>{s.avg.toFixed(2)}</strong></div>
                        <div>Min: {s.min.toLocaleString()} / Max: {s.max.toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <div className="border rounded-lg overflow-auto max-h-[600px]">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col} className="min-w-[120px]">
                  <div className="space-y-1">
                    <button
                      onClick={() => handleSort(col)}
                      className="flex items-center gap-1 font-semibold hover:text-blue-600 text-left"
                    >
                      {col}
                      <ArrowUpDown className="h-3 w-3 opacity-50" />
                      {sortConfig.key === col && (
                        <span className="text-blue-600 text-xs">
                          {sortConfig.direction === "asc" ? "\u2191" : "\u2193"}
                        </span>
                      )}
                    </button>
                    {showFilters && (
                      <Input
                        placeholder={`Filter...`}
                        value={columnFilters[col] || ""}
                        onChange={(e) => setColumnFilter(col, e.target.value)}
                        className="h-6 text-xs"
                      />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                  No records match the current filters
                </TableCell>
              </TableRow>
            ) : (
              sortedRows.map((row, idx) => (
                <TableRow key={idx}>
                  {columns.map((col) => {
                    const val = row[col];
                    const display =
                      val == null
                        ? "-"
                        : typeof val === "object"
                        ? JSON.stringify(val)
                        : String(val);
                    return <TableCell key={col}>{display}</TableCell>;
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ===========================================================================
// Main Component
// ===========================================================================
export default function AppReporting() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Physical Inventory Comparison State
  const [piData, setPiData] = useState(null);
  const [piLoading, setPiLoading] = useState(false);

  // Entity Comparison State
  const [leftEntity, setLeftEntity] = useState("");
  const [rightEntity, setRightEntity] = useState("");
  const [leftJoinField, setLeftJoinField] = useState("");
  const [rightJoinField, setRightJoinField] = useState("");
  const [availableFields, setAvailableFields] = useState({ left: [], right: [] });
  const [selectedFields, setSelectedFields] = useState({ left: [], right: [] });
  const [comparisonData, setComparisonData] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  const entities = [
    "Trailer",
    "InstallationLog",
    "PhysicalInventory",
    "Branch",
    "ProductionDelay",
    "ScanLog",
    "EquipmentValidation",
    "InstallationDelay",
  ];

  useEffect(() => {
    checkAccess();
  }, []);

  // Reset selected fields when left entity changes
  useEffect(() => {
    setSelectedFields((prev) => ({ ...prev, left: [] }));
    setLeftJoinField("");
    setComparisonData(null);
  }, [leftEntity]);

  // Reset selected fields when right entity changes
  useEffect(() => {
    setSelectedFields((prev) => ({ ...prev, right: [] }));
    setRightJoinField("");
    setComparisonData(null);
  }, [rightEntity]);

  const checkAccess = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      if (userData.email !== "tom@tmmit.com") {
        toast.error("Access Denied");
        window.location.href = "/";
      }
    } catch (error) {
      toast.error("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Physical Inventory
  // -------------------------------------------------------------------------
  const loadPhysicalInventoryComparison = async () => {
    setPiLoading(true);
    try {
      const response = await base44.functions.invoke("comparePhysicalInventoryToTrailers", {});
      setPiData(response.data);
      toast.success(`Loaded ${response.data.total_matched} matched records`);
    } catch (error) {
      toast.error("Failed to load comparison: " + error.message);
    } finally {
      setPiLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Entity Schema Loading (robust: tries multiple schema shapes + sample data)
  // -------------------------------------------------------------------------
  const extractFieldsFromSchema = (obj) => {
    if (!obj || typeof obj !== "object") return [];

    // Direct properties at top level: { properties: { field: ... } }
    if (obj.properties && typeof obj.properties === "object") {
      return Object.keys(obj.properties);
    }
    // Wrapped in schema key: { schema: { properties: { ... } } }
    if (obj.schema?.properties && typeof obj.schema.properties === "object") {
      return Object.keys(obj.schema.properties);
    }
    // Array/items wrapper: { items: { properties: { ... } } }
    if (obj.items?.properties && typeof obj.items.properties === "object") {
      return Object.keys(obj.items.properties);
    }
    // Definitions wrapper: { definitions: { EntityName: { properties: { ... } } } }
    if (obj.definitions && typeof obj.definitions === "object") {
      const firstDef = Object.values(obj.definitions)[0];
      if (firstDef?.properties) {
        return Object.keys(firstDef.properties);
      }
    }
    // If the object itself looks like a flat field map: { field1: { type: ... }, field2: ... }
    const keys = Object.keys(obj);
    if (keys.length > 0 && keys.every((k) => typeof obj[k] === "object" && obj[k] !== null)) {
      const hasTypeKeys = keys.some((k) => obj[k].type || obj[k].enum || obj[k].format);
      if (hasTypeKeys) return keys;
    }

    return [];
  };

  const loadEntitySchema = async (entityName, side) => {
    try {
      let fields = [];

      // Strategy 1: Try .schema()
      try {
        const schema = await base44.entities[entityName].schema();
        console.log(`Schema response for ${entityName}:`, JSON.stringify(schema).slice(0, 500));
        fields = extractFieldsFromSchema(schema);
      } catch (schemaErr) {
        console.warn(`schema() failed for ${entityName}:`, schemaErr.message);
      }

      // Strategy 2: Fall back to loading sample records
      if (fields.length === 0) {
        console.log(`Falling back to sample data for ${entityName}`);
        try {
          const sampleData = await base44.entities[entityName].list("", 1);
          const records = Array.isArray(sampleData) ? sampleData : sampleData?.data || sampleData?.items || [];
          if (records.length > 0) {
            fields = Object.keys(records[0]);
          }
        } catch (listErr) {
          console.warn(`list() with ("", 1) failed for ${entityName}:`, listErr.message);
          // Try without arguments or with different signature
          try {
            const sampleData2 = await base44.entities[entityName].list();
            const records2 = Array.isArray(sampleData2) ? sampleData2 : sampleData2?.data || sampleData2?.items || [];
            if (records2.length > 0) {
              fields = Object.keys(records2[0]);
            }
          } catch (listErr2) {
            console.warn(`list() with no args also failed for ${entityName}:`, listErr2.message);
          }
        }
      }

      // Include built-in fields that might not appear in schema
      const builtInFields = ["id", "created_date", "updated_date", "created_by"];
      fields = [...new Set([...builtInFields, ...fields])];

      setAvailableFields((prev) => ({
        ...prev,
        [side]: fields,
      }));

      const schemaFieldCount = fields.length - builtInFields.length;
      if (schemaFieldCount > 0) {
        toast.success(`Loaded ${fields.length} fields from ${entityName} (${schemaFieldCount} entity fields + ${builtInFields.length} built-in)`);
      } else {
        toast.warning(`Only found built-in fields for ${entityName}. Schema may not be accessible — check console for details.`);
      }
    } catch (error) {
      toast.error("Failed to load schema: " + error.message);
      console.error("Schema load error:", error);
    }
  };

  // -------------------------------------------------------------------------
  // Field Selection
  // -------------------------------------------------------------------------
  const toggleField = (side, field) => {
    setSelectedFields((prev) => {
      const current = prev[side];
      const exists = current.includes(field);
      return {
        ...prev,
        [side]: exists ? current.filter((f) => f !== field) : [...current, field],
      };
    });
  };

  const selectAllFields = (side) => {
    const allFields = availableFields[side];
    setSelectedFields((prev) => ({ ...prev, [side]: [...allFields] }));
  };

  const deselectAllFields = (side) => {
    setSelectedFields((prev) => ({ ...prev, [side]: [] }));
  };

  // -------------------------------------------------------------------------
  // Run Comparison
  // -------------------------------------------------------------------------
  const runComparison = async () => {
    const totalSelected = selectedFields.left.length + selectedFields.right.length;
    if (!leftEntity || !rightEntity || !leftJoinField || !rightJoinField || totalSelected === 0) {
      toast.error("Please select entities, join fields for both sides, and at least one display field");
      return;
    }

    setComparisonLoading(true);
    try {
      // Build the selectedFields payload in the format the backend expects
      const fieldPayload = [
        ...selectedFields.left.map((f) => ({ entity: leftEntity, field: f })),
        ...selectedFields.right.map((f) => ({ entity: rightEntity, field: f })),
      ];

      const response = await base44.functions.invoke("compareEntities", {
        leftEntity,
        rightEntity,
        joinField: leftJoinField,
        leftJoinField,
        rightJoinField,
        selectedFields: fieldPayload,
      });
      setComparisonData(response.data);
      toast.success(`Comparison complete: ${response.data.summary.total_matched} matches`);
    } catch (error) {
      toast.error("Comparison failed: " + error.message);
    } finally {
      setComparisonLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              APP Reporting
            </h1>
            <p className="text-gray-600 mt-1">Advanced data comparison and analysis tools</p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            Access: {user?.email}
          </Badge>
        </div>

        <Tabs defaultValue="entity-comparison" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="physical-inventory">
              <Database className="h-4 w-4 mr-2" />
              Physical Inventory vs Trailers
            </TabsTrigger>
            <TabsTrigger value="entity-comparison">
              <GitCompare className="h-4 w-4 mr-2" />
              Entity Comparison Tool
            </TabsTrigger>
          </TabsList>

          {/* ============================================================= */}
          {/* Physical Inventory Tab                                        */}
          {/* ============================================================= */}
          <TabsContent value="physical-inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Physical Inventory to Trailer Database Comparison</CardTitle>
                <CardDescription>
                  Compare scanned physical inventory records with trailer database entries
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={loadPhysicalInventoryComparison} disabled={piLoading}>
                  {piLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Load Comparison
                </Button>

                {piData && (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardDescription>Total Physical Inventory</CardDescription>
                          <CardTitle className="text-3xl">
                            {piData.total_physical_inventory?.toLocaleString()}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardDescription>Matched in Trailer DB</CardDescription>
                          <CardTitle className="text-3xl text-green-600">
                            {piData.total_matched?.toLocaleString()}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardDescription>Match Rate</CardDescription>
                          <CardTitle className="text-3xl">
                            {piData.total_physical_inventory
                              ? (
                                  (piData.total_matched / piData.total_physical_inventory) *
                                  100
                                ).toFixed(1) + "%"
                              : "N/A"}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    </div>

                    <DataTableWithFilters
                      data={piData.data}
                      filename="physical-inventory-comparison"
                      title="Physical Inventory Comparison"
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================================= */}
          {/* Entity Comparison Tab                                         */}
          {/* ============================================================= */}
          <TabsContent value="entity-comparison" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dual Database Comparison Tool</CardTitle>
                <CardDescription>
                  Select two entities (left &amp; right), choose a shared field to join on, pick
                  which columns to display, then run the comparison. Results can be filtered,
                  sorted, and exported.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Entity Selectors */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Entity */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Left Entity (Database)</label>
                      <Select
                        value={leftEntity}
                        onValueChange={(val) => {
                          setLeftEntity(val);
                          loadEntitySchema(val, "left");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select left database" />
                        </SelectTrigger>
                        <SelectContent>
                          {entities.map((e) => (
                            <SelectItem key={e} value={e}>
                              {e}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {leftEntity && availableFields.left.length > 0 && (
                      <FieldSelector
                        entityName={leftEntity}
                        fields={availableFields.left}
                        selected={selectedFields.left}
                        onToggle={(field) => toggleField("left", field)}
                        onSelectAll={() => selectAllFields("left")}
                        onDeselectAll={() => deselectAllFields("left")}
                      />
                    )}
                  </div>

                  {/* Right Entity */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Right Entity (Database)</label>
                      <Select
                        value={rightEntity}
                        onValueChange={(val) => {
                          setRightEntity(val);
                          loadEntitySchema(val, "right");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select right database" />
                        </SelectTrigger>
                        <SelectContent>
                          {entities.map((e) => (
                            <SelectItem key={e} value={e}>
                              {e}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {rightEntity && availableFields.right.length > 0 && (
                      <FieldSelector
                        entityName={rightEntity}
                        fields={availableFields.right}
                        selected={selectedFields.right}
                        onToggle={(field) => toggleField("right", field)}
                        onSelectAll={() => selectAllFields("right")}
                        onDeselectAll={() => deselectAllFields("right")}
                      />
                    )}
                  </div>
                </div>

                {/* Join Fields (one from each side) */}
                <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
                  <label className="text-sm font-semibold block">
                    Join Fields (PKID) &mdash; select the key field from each entity to match records
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">
                        Left key ({leftEntity || "..."})
                      </label>
                      {leftEntity && availableFields.left.length > 0 ? (
                        <Select value={leftJoinField} onValueChange={setLeftJoinField}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select left join field" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableFields.left.map((field) => (
                              <SelectItem key={field} value={field}>
                                {field}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Select a left entity first</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">
                        Right key ({rightEntity || "..."})
                      </label>
                      {rightEntity && availableFields.right.length > 0 ? (
                        <Select value={rightJoinField} onValueChange={setRightJoinField}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select right join field" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableFields.right.map((field) => (
                              <SelectItem key={field} value={field}>
                                {field}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Select a right entity first</p>
                      )}
                    </div>
                  </div>
                  {leftJoinField && rightJoinField && (
                    <p className="text-xs text-green-700">
                      Join: <strong>{leftEntity}.{leftJoinField}</strong> = <strong>{rightEntity}.{rightJoinField}</strong>
                    </p>
                  )}
                </div>

                {/* Summary of selections */}
                {(selectedFields.left.length > 0 || selectedFields.right.length > 0) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <strong>Selection summary:</strong>{" "}
                    {selectedFields.left.length} field(s) from{" "}
                    <Badge variant="outline">{leftEntity || "?"}</Badge>,{" "}
                    {selectedFields.right.length} field(s) from{" "}
                    <Badge variant="outline">{rightEntity || "?"}</Badge>
                    {leftJoinField && rightJoinField && (
                      <>
                        , joined on <Badge>{leftEntity}.{leftJoinField}</Badge> = <Badge>{rightEntity}.{rightJoinField}</Badge>
                      </>
                    )}
                  </div>
                )}

                {/* Run Button */}
                <div className="flex gap-3">
                  <Button
                    onClick={runComparison}
                    disabled={
                      comparisonLoading ||
                      !leftEntity ||
                      !rightEntity ||
                      !leftJoinField ||
                      !rightJoinField ||
                      (selectedFields.left.length + selectedFields.right.length === 0)
                    }
                  >
                    {comparisonLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Run Comparison
                  </Button>
                </div>

                {/* Results */}
                {comparisonData && (
                  <>
                    <div className="grid grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardDescription>{leftEntity} Records</CardDescription>
                          <CardTitle className="text-2xl">
                            {comparisonData.summary.total_left_records?.toLocaleString()}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardDescription>{rightEntity} Records</CardDescription>
                          <CardTitle className="text-2xl">
                            {comparisonData.summary.total_right_records?.toLocaleString()}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardDescription>Matched</CardDescription>
                          <CardTitle className="text-2xl text-green-600">
                            {comparisonData.summary.total_matched?.toLocaleString()}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardDescription>Match Rate</CardDescription>
                          <CardTitle className="text-2xl">
                            {comparisonData.summary.match_rate}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    </div>

                    <DataTableWithFilters
                      data={comparisonData.data}
                      filename="entity-comparison"
                      title="Entity Comparison"
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Field Selector sub-component
// ---------------------------------------------------------------------------
function FieldSelector({ entityName, fields, selected, onToggle, onSelectAll, onDeselectAll }) {
  return (
    <div className="border rounded-lg p-4 max-h-[300px] overflow-auto">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium">
          Select Fields ({selected.length}/{fields.length})
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={onSelectAll}>
            All
          </Button>
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={onDeselectAll}>
            None
          </Button>
        </div>
      </div>
      {fields.map((field) => (
        <div key={field} className="flex items-center gap-2 py-1">
          <Checkbox
            id={`${entityName}-${field}`}
            checked={selected.includes(field)}
            onCheckedChange={() => onToggle(field)}
          />
          <label htmlFor={`${entityName}-${field}`} className="text-sm cursor-pointer">
            {field}
          </label>
        </div>
      ))}
    </div>
  );
}
