import "jspdf-autotable";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import MasterTable from "../masterTable/MasterTable";

// Create stable default references outside component to prevent re-creation
const defaultApiPayload = {};
const defaultGet = async () => { };
const defaultOnSelectionChanged = () => { };
const defaultOnToolbarPreparing = () => { };
const defaultOnEditorPreparing = () => { };
const defaultOnRowInserting = () => { };
const defaultOnRowUpdating = () => { };

function CrudMUI({
  colAttributes,
  EDIT,
  ADD,
  DELETE,
  GET,
  view = false,
  summaries = [],
  onSelectionChanged,
  editMode = "popup",
  onToolbarPreparing,
  apiPayload,
  onEditorPreparing,
  onRowInserting,
  onRowUpdating,
  apiKey = "Id",
  selectionMode = "single",
  columnAutoWidth = true,
  wordWrapEnabled = true,
  scrollingMode = "virtual",
  rowRenderingMode = "virtual",
  columnRenderingMode,
  showScrollbar = "never",
  useNativeScrolling = false,
}) {
  const { t } = useTranslation();
  
  // Use stable references for default values
  const stableApiPayload = apiPayload || defaultApiPayload;
  const stableGet = GET || defaultGet;
  const stableOnSelectionChanged = onSelectionChanged || defaultOnSelectionChanged;
  const stableOnToolbarPreparing = onToolbarPreparing || defaultOnToolbarPreparing;
  const stableOnEditorPreparing = onEditorPreparing || defaultOnEditorPreparing;
  const stableOnRowInserting = onRowInserting || defaultOnRowInserting;
  const stableOnRowUpdating = onRowUpdating || defaultOnRowUpdating;
  
  // Memoize columns to prevent recreation
  const cols = useMemo(() => colAttributes, [colAttributes]);
  
  // Memoize summary to prevent recreation on every render
  const summary = useMemo(() => [
    {
      column: "Id",
      summaryType: "count",
      valueFormat: "currency",
      cssClass: "summaryNetSum",
      showInColumn: "Id",
      customizeText: (data) => {
        return `${t("Count")}: ${data.value} `;
      },
    },
  ], [t]);

  return (
    <>
      <MasterTable
        apiMethod={stableGet}
        apiPayload={stableApiPayload}
        apiKey={apiKey}
        remoteOperations={true}
        colAttributes={cols}
        // allowAdd={!view && lookups.Roles.includes(page + "Add")}
        // allowUpdate={!view && lookups.Roles.includes(page + "Update")}
        // allowDelete={!view && lookups.Roles.includes(page + "Delete")}
        allowAdd={!view}
        allowUpdate={!view}
        allowDelete={!view}
        insertApiMethod={ADD}
        updateApiMethod={EDIT}
        removeApiMethod={DELETE}
        summaryItems={summary}
        onSelectionChanged={stableOnSelectionChanged}
        editMode={editMode}
        onToolbarPreparing={stableOnToolbarPreparing}
        onEditorPreparing={stableOnEditorPreparing}
        onRowInserting={stableOnRowInserting}
        onRowUpdating={stableOnRowUpdating}
        selectionMode={selectionMode}
        columnAutoWidth={columnAutoWidth}
        wordWrapEnabled={wordWrapEnabled}
        scrollingMode={scrollingMode}
        rowRenderingMode={rowRenderingMode}
        columnRenderingMode={columnRenderingMode}
        showScrollbar={showScrollbar}
        useNativeScrolling={useNativeScrolling}
      />
    </>
  );
}

export default React.memo(CrudMUI, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.colAttributes === nextProps.colAttributes &&
    prevProps.EDIT === nextProps.EDIT &&
    prevProps.ADD === nextProps.ADD &&
    prevProps.DELETE === nextProps.DELETE &&
    prevProps.GET === nextProps.GET &&
    prevProps.view === nextProps.view &&
    prevProps.editMode === nextProps.editMode &&
    prevProps.apiKey === nextProps.apiKey &&
    prevProps.apiPayload === nextProps.apiPayload &&
    prevProps.selectionMode === nextProps.selectionMode &&
    prevProps.columnAutoWidth === nextProps.columnAutoWidth &&
    prevProps.wordWrapEnabled === nextProps.wordWrapEnabled &&
    prevProps.scrollingMode === nextProps.scrollingMode &&
    prevProps.rowRenderingMode === nextProps.rowRenderingMode &&
    prevProps.columnRenderingMode === nextProps.columnRenderingMode &&
    prevProps.showScrollbar === nextProps.showScrollbar &&
    prevProps.useNativeScrolling === nextProps.useNativeScrolling &&
    prevProps.onSelectionChanged === nextProps.onSelectionChanged &&
    prevProps.onToolbarPreparing === nextProps.onToolbarPreparing &&
    prevProps.onEditorPreparing === nextProps.onEditorPreparing &&
    prevProps.onRowInserting === nextProps.onRowInserting &&
    prevProps.onRowUpdating === nextProps.onRowUpdating
  );
});
