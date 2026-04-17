import {
  Button,
  Column,
  ColumnChooser,
  DataGrid,
  Editing,
  Export,
  FilterRow,
  Form,
  GroupItem,
  GroupPanel,
  HeaderFilter,
  LoadPanel,
  Lookup,
  MasterDetail,
  Paging,
  Popup,
  RequiredRule,
  Scrolling,
  SearchPanel,
  Summary,
  TotalItem,
} from "devextreme-react/data-grid";
import { Item } from "devextreme-react/form";
import TagBox from "devextreme-react/tag-box";
import CustomStore from "devextreme/data/custom_store";
import { exportDataGrid } from "devextreme/excel_exporter";
import notify from "devextreme/ui/notify";
import ExcelJS from "exceljs";
import saveAs from "file-saver";
import "jspdf-autotable";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation } from "react-i18next";

function MasterTable({
  id = "",
  disabled = false,
  //* "single" "multiple"
  selectionMode = "single",
  //* [{ }, ...]
  dataSource = [],
  //* colAttributes = [{ field : "Target attribute in our object",
  //*                    caption : "Text will appear in column header",
  //*                    isVisable : true or false
  //*                    dataType? : "string" as defualt "number" "data" "dataTime" "boolean" "object",
  //*                    alignment? : "right" as defualt "left" "center"
  //*                    format?: "currency"
  //*                    widthRatio? : "150px" as defualt
  //*                  }, ... ]
  colAttributes = [],
  width = "100%",
  height = "70vh",
  filterRow = false,
  groupPanel = false,
  headerFilter = false,
  allowAdd = false,
  allowUpdate = false,
  allowDelete = false,
  allowPrint = false,
  allowExcel = false,
  allowPaging = false,
  columnChooser = true,
  HeaderComponent,
  pageSize = 5,
  onSelectionChanged,
  onRowRemoving,
  onRowRemoved,
  onRowUpdating,
  onRowDoubleClick,
  onRowInserting,
  onSaving,
  RowDetails,
  /*
   *   summaryItems = [{column:"id",
   *                    summaryType:"sum",
   *                    valueFormat:"currency",
   *                    cssClass:"summaryNetSum",
   *                    showInColumn:"id"
   *                    customizeText:customizeTextHandler}
   *                  ]
   * */
  summaryItems = [],
  tableGroupSummary = [],
  onToolbarPreparing,
  deleteMessage = "Are you sure to delete this element?",
  remoteOperations = false,
  remote = false,
  apiMethod,
  removeApiMethod,
  insertApiMethod,
  updateApiMethod,
  removeApiPayload = {},
  otherMethod,
  apiPayload,
  apiKey,
  allowSelectAllMode = true,
  onFilterValuesChange,
  editMode = "popup",
  searchPanel = true,
  onEditorPreparing,
  columnAutoWidth = true,
  wordWrapEnabled = true,
  scrollingMode = "virtual",
  rowRenderingMode = "virtual",
  columnRenderingMode,
  showScrollbar = "never",
  useNativeScrolling = false,
}) {
  const { t, i18n } = useTranslation();
  const dataGridRef = useRef(null);
  const retrieved = useRef([]);
  const pendingLoads = useRef(new Map()); // Cache pending API calls to prevent duplicates
  function isValidDate(dateString) {
    return !isNaN(Date.parse(dateString));
  }
  const refreshDataGrid = useCallback(() => {
    retrieved.current = []; // Reset retrieved data on manual refresh
    pendingLoads.current.clear(); // Clear pending loads cache
    dataGridRef.current?.instance?.refresh();
  }, []);
  
  const [showFilterRow, setShowFilterRow] = useState(false);

  const handleContentReady = useCallback((e) => {
    if (e?.component?.updateDimensions) {
      e.component.updateDimensions();
    }
  }, []);



  const handleToolbarPreparing = useCallback((e) => {
    let toolbarItems = e.toolbarOptions.items;

    toolbarItems.unshift({
      // Use unshift to add it before other items
      widget: "dxCheckBox",
      location: "before",
      options: {
        value: showFilterRow,
        onValueChanged: () => setShowFilterRow(!showFilterRow),
        text: t("Filter Row"),
      },
    });

    // Refresh button
    toolbarItems.unshift({
      widget: "dxButton",
      options: { icon: "refresh", onClick: refreshDataGrid },
      location: "after",
    });

    // Reset filters button – clears filter row and refreshes
    toolbarItems.unshift({
      widget: "dxButton",
      options: {
        text: t("Reset") || "Reset",
        onClick: () => {
          const grid = e.component;
          if (grid && typeof grid.clearFilter === "function") {
            grid.clearFilter();
          }
          refreshDataGrid();
        },
      },
      location: "after",
    });
    onToolbarPreparing && onToolbarPreparing(toolbarItems);
  }, [showFilterRow, refreshDataGrid, t, onToolbarPreparing]);
  
  // Store of API data
  const store = useMemo(
    () =>
      new CustomStore({
        // Key of this object
        key: apiKey,
        // OnLoad Event
        // (skip, take) => {return {data, totalCount}}
        load: function (props) {
          const { skip = 0, take = 20, filter } = props;
          // Create a filter sql statementbuttons

          const filterO = {};
          if (filter) {
            var res = [];
            if (typeof filter[0] === "string") {
              res[0] = filter;
            } else {
              res = filter;
            }
            function loop(res = []) {
              res.forEach((e) => {
                if (e.length > 1 && Array.isArray(e)) {
                  if (Array.isArray(e[0])) {
                    loop(e);
                  } else if (isValidDate(e[2]) && e[1] == ">=") {
                    filterO["From"] = e[2];
                  } else if (isValidDate(e[2]) instanceof Date && e[1] == "<") {
                    filterO["To"] = e[2];
                  } else {
                    //   if (res.includes("or") && typeof e[2] === "string") {
                    //     filterO["Search"] = e[2];
                    //   }
                    //   //  if (typeof e[2] === "object")
                    //   else {
                    //     filterO[e[0]] = e[2];
                    //   }
                    filterO[res.includes("or") ? "Search" : e[0]] = e[2];
                  }
                }
              });
            }
            loop(res);
          }
          
          // Calculate pageIndex: backend uses 1-based indexing (PageIndex starts at 1)
          // skip=0 → page 1, skip=20 → page 2, skip=120 → page 7
          const pageIndex = Math.floor(skip / take) + 1;
          const loadKey = JSON.stringify({ pageIndex, filterO, skip, take });
          
          // Check if there's already a pending request for the same parameters
          if (pendingLoads.current.has(loadKey)) {
            // Return the existing promise to prevent duplicate API calls
            return pendingLoads.current.get(loadKey);
          }
          
          console.log("load data - skip:", skip, "take:", take, "pageIndex:", pageIndex);
          // Create the API call promise
          const loadPromise = apiMethod({
            ...apiPayload,
            ...filterO,
            PageIndex: pageIndex,
            PageSize: take,
          }).then((data) => {
            // Reset retrieved data when loading page 1 (first page)
            if (pageIndex === 1) {
              retrieved.current = data.Data || [];
            } else {
              // For subsequent pages, append only if not already present (deduplicate by apiKey)
              const existingIds = new Set(retrieved.current.map(item => item[apiKey]));
              const newData = (data.Data || []).filter(item => !existingIds.has(item[apiKey]));
              retrieved.current = [...retrieved.current, ...newData];
            }
            
            // Remove from cache after successful load
            pendingLoads.current.delete(loadKey);
            
            return {
              data: data.Data || [],
              totalCount: data.TotalCount ? data.TotalCount : 0,
              summary: [data.TotalCount || 0],
            };
          }).catch((error) => {
            // Remove from cache on error so retry can work
            pendingLoads.current.delete(loadKey);
            throw error;
          });
          
          // Cache the promise
          pendingLoads.current.set(loadKey, loadPromise);
          
          return loadPromise;
        },

        remove: async (key) => {
          if (key) {
            try {
              await removeApiMethod(key);
            } catch (err) {
              notify(
                t(
                  err.Message ? err.Message : "Error in information. try again!"
                ),
                "error",
                3000
              );
              throw err;
            }
          }
        },
        insert: async (obj) => {
          try {
            await insertApiMethod({ [apiKey]: 0, ...obj });
          } catch (err) {
            // Parse error message from different error formats
            let errorMessage = "Error in information. try again!";
            if (err) {
              if (err.Message) {
                errorMessage = err.Message;
              } else if (err.title) {
                errorMessage = err.title;
                // If there are validation errors, append them
                if (err.errors && typeof err.errors === 'object') {
                  const validationErrors = [];
                  Object.keys(err.errors).forEach(key => {
                    const fieldErrors = Array.isArray(err.errors[key]) 
                      ? err.errors[key] 
                      : [err.errors[key]];
                    validationErrors.push(...fieldErrors);
                  });
                  if (validationErrors.length > 0) {
                    errorMessage += ": " + validationErrors.join(", ");
                  }
                }
              } else if (typeof err === 'string') {
                errorMessage = err;
              } else if (err.message) {
                errorMessage = err.message;
              } else if (err.error) {
                errorMessage = typeof err.error === 'string' ? err.error : JSON.stringify(err.error);
              }
            }
            notify(
              t(errorMessage),
              "error",
              5000
            );
            throw err;
          }
        },
        update: async function (key, values) {
          try {
            await updateApiMethod({
              [apiKey]: key,
              ...retrieved.current.find((e) => e[apiKey] == key),
              ...values,
            });
          } catch (err) {
            // Parse error message from different error formats
            let errorMessage = "Error in information. try again!";
            if (err) {
              if (err.Message) {
                errorMessage = err.Message;
              } else if (err.title) {
                errorMessage = err.title;
                // If there are validation errors, append them
                if (err.errors && typeof err.errors === 'object') {
                  const validationErrors = [];
                  Object.keys(err.errors).forEach(key => {
                    const fieldErrors = Array.isArray(err.errors[key]) 
                      ? err.errors[key] 
                      : [err.errors[key]];
                    validationErrors.push(...fieldErrors);
                  });
                  if (validationErrors.length > 0) {
                    errorMessage += ": " + validationErrors.join(", ");
                  }
                }
              } else if (typeof err === 'string') {
                errorMessage = err;
              } else if (err.message) {
                errorMessage = err.message;
              } else if (err.error) {
                errorMessage = typeof err.error === 'string' ? err.error : JSON.stringify(err.error);
              }
            }
            notify(
              t(errorMessage),
              "error",
              5000
            );
            throw err;
          }
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      apiKey,
      apiMethod,
      apiPayload,
      removeApiMethod,
      updateApiMethod,
      insertApiMethod,
    ]
  );
  const data = remoteOperations ? store : dataSource;
  return (
    <React.Fragment>
      <DataGrid
        dataSource={data}
        disabled={disabled}
        id={id}
        ref={dataGridRef}
        width={width}
        height={height}
        showRowLines={true}
        hoverStateEnabled={true}
        rtlEnabled={i18n.language === "ar"}
        showBorders={true}
        onEditorPreparing={onEditorPreparing}
        columnAutoWidth={columnAutoWidth}
        allowColumnResizing={true}
        wordWrapEnabled={wordWrapEnabled}
        selection={{
          mode: selectionMode,
          allowSelectAll: allowSelectAllMode,
          showCheckBoxesMode: selectionMode === "multiple" ? "always" : "none",
        }}
        onSelectionChanged={onSelectionChanged}
        onRowRemoving={onRowRemoving}
        onRowUpdating={onRowUpdating}
        onRowInserting={onRowInserting}
        onToolbarPreparing={handleToolbarPreparing}
        onExporting={onExportingHandle}
        onRowDblClick={onRowDoubleClick}
        onSaving={onSaving}
        onContentReady={handleContentReady}
        remoteOperations={
          remoteOperations
            ? {
                filtering: remoteOperations,
                summary: remoteOperations,
                paging: true,
              }
            : false
        }
        sorting={!remoteOperations}
      >
        <SearchPanel
          visible={searchPanel}
          width={240}
          placeholder={t("Search...")}
        />
        <ColumnChooser enabled={columnChooser} />
        <FilterRow visible={showFilterRow} />
        <HeaderFilter visible={headerFilter} />
        <GroupPanel visible={groupPanel} />
        <Editing
          mode={"popup"}
          useIcons={true}
          allowAdding={allowAdd}
          allowDeleting={allowDelete}
          allowUpdating={allowUpdate}
        >
          {" "}
          <Popup title="Items" showTitle={true} width={800} height={600} />
          <Form>
            <Item itemType="group" colCount={2} colSpan={2}>
              {colAttributes?.length > 0 &&
                colAttributes.map((col, index) => (
                  <Item dataField={col.field} />
                ))}
            </Item>
          </Form>
          {/* <Texts
            exportAll={t("export all")}
            exportSelectedRows={t("export selected")}
            exportTo={t("export to")}
            addRow={t("add new")}
            editRow={t("Update")}
            saveRowChanges={t("Save")}
            cancelRowChanges={t("Cancel")}
            deleteRow={t("Remove")}
            confirmDeleteMessage={t(deleteMessage)}
          /> */}
        </Editing>
        <Scrolling
          mode={scrollingMode}
          rowRenderingMode={rowRenderingMode}
          columnRenderingMode={columnRenderingMode}
          showScrollbar={showScrollbar}
          useNative={useNativeScrolling}
        />
        <Paging enabled={true} defaultPageSize={20} />

        {colAttributes?.length > 0 &&
          colAttributes.map((col, index) => {
            const resolveMaybeFn = (value, args) =>
              typeof value === "function" ? value(args) : value;

            const renderMultiSelectEditor = col.multiple
              ? (cellElement, cellInfo) => {
                  const container = document.createElement("div");
                  cellElement.appendChild(container);
                  const root = createRoot(container);

                  const defaultDataSource =
                    resolveMaybeFn(col.data, {
                      cellInfo,
                      rowData: cellInfo?.data ?? cellInfo?.row?.data,
                    }) || [];

                  const tagBoxPropsRaw = resolveMaybeFn(col.tagBoxProps, {
                    cellInfo,
                    rowData: cellInfo?.data ?? cellInfo?.row?.data,
                    t,
                    i18n,
                  });

                  const tagBoxProps =
                    tagBoxPropsRaw && typeof tagBoxPropsRaw === "object"
                      ? tagBoxPropsRaw
                      : {};

                  const resolvedValueExpr =
                    resolveMaybeFn(col.value, {
                      cellInfo,
                      rowData: cellInfo?.data ?? cellInfo?.row?.data,
                    }) ||
                    tagBoxProps.valueExpr ||
                    "Id";

                  const resolvedDisplayExpr =
                    resolveMaybeFn(
                      i18n.language === "en"
                        ? col.displayEn ?? col.display
                        : col.display,
                      {
                        cellInfo,
                        rowData: cellInfo?.data ?? cellInfo?.row?.data,
                      }
                    ) || tagBoxProps.displayExpr;

                  const resolvedDataSource =
                    tagBoxProps.dataSource || defaultDataSource;

                  const userOnValueChanged = tagBoxProps.onValueChanged;

                  const handleValueChange = (e) => {
                    userOnValueChanged?.(e);
                    const nextValue = Array.isArray(e?.value) ? e.value : [];
                    if (typeof col.onTagBoxValueChanged === "function") {
                      col.onTagBoxValueChanged({
                        event: e,
                        cellInfo,
                        setValue: cellInfo.setValue,
                        value: nextValue,
                      });
                    } else {
                      cellInfo.setValue(nextValue);
                    }
                  };

                  const handleDisposing = (args) => {
                    if (typeof tagBoxProps.onDisposing === "function") {
                      tagBoxProps.onDisposing(args);
                    }
                    setTimeout(() => root.unmount(), 0);
                  };

                  const resolvedValue =
                    tagBoxProps.value !== undefined
                      ? tagBoxProps.value
                      : Array.isArray(cellInfo.value)
                      ? cellInfo.value
                      : [];

                  root.render(
                    <TagBox
                      dataSource={resolvedDataSource}
                      valueExpr={resolvedValueExpr}
                      displayExpr={resolvedDisplayExpr}
                      value={resolvedValue}
                      showSelectionControls={
                        tagBoxProps.showSelectionControls ?? true
                      }
                      applyValueMode={tagBoxProps.applyValueMode ?? "useButtons"}
                      searchEnabled={tagBoxProps.searchEnabled ?? true}
                      rtlEnabled={
                        tagBoxProps.rtlEnabled ?? i18n.language === "ar"
                      }
                      noDataText={tagBoxProps.noDataText ?? t("No data")}
                      placeholder={tagBoxProps.placeholder ?? t("Select...")}
                      {...tagBoxProps}
                      onValueChanged={handleValueChange}
                      onDisposing={handleDisposing}
                    />
                  );
                }
              : undefined;


              const formatBrokersCell =  (rowData) => {
                const NameMap = new Map();
                console.log(col.data)
                if (col.data && Array.isArray(col.data)) { 
                  col.data.forEach((item) => {
                    if (item?.[col.value] != null) {
                      NameMap.set(
                        item[col.value],
                        item[col.display],
                      );
                    }
                  });
                }


                if (!rowData) return "";
                const ids = rowData[col.field];
                if (!ids || !Array.isArray(ids) || ids.length === 0) return "";
                console.log(NameMap)
                return ids
                  .map((id) => NameMap.get(id) ?? String(id))
                  .filter(Boolean)
                  .join(", ");
              } 
            return (
              <Column
                key={index}
                name={col.field}
                dataType={col.type}
                type={col.type}
                visible={col.isVisable}
                dataField={col.field}
                allowEditing={!col.disable}
                caption={
                  i18n.language === "en"
                    ? col.captionEn ?? col.caption
                    : col.caption
                }
                format={col.type == "date" ? "yyyy/MM/dd HH:mm:ss" : null}
                alignment={
                  col.alignment || (i18n.language === "ar" ? "right" : "left")
                }
                cssClass={col.cssClass}
                grouped={col.grouped}
                groupIndex={col.groupIndex}
                autoExpandGroup={false}
                onFilterValuesChange={onFilterValuesChange}
                allowFiltering={col.HideFilter ? false : true}
                calculateCellValue={col.multiple ?formatBrokersCell: col.calculateCellValueHandle}
                cellTemplate={col.cellTemplate}
                cellRender={col.cellRender}
                calculateDisplayValue={col.calculateDisplayValue}
                calculateFilterExpression={col.calculateFilterExpression}
                editCellComponent={col.editCellComponent}
                editCellRender={col.editCellRender}
                width={col.widthRatio ? `${col.widthRatio}px` : null}
                minWidth={col.minWidth}
                setCellValue={col.setCellValue}
                editCellTemplate={
                  col.editCellTemplate ?? renderMultiSelectEditor
                }
              >
                {col.lookup ? (
                  <Lookup {...col.lookup} />
                ) : !col.multiple && col.data ? (
                  <Lookup
                    dataSource={col.data}
                    displayExpr={
                      i18n.language === "en"
                        ? col.displayEn ?? col.display
                        : col.display
                    }
                    valueExpr={col.value ? col.value : "id"}
                  />
                ) : null}
                {col.type == "buttons" ? (
                  <Button
                    text={col.text}
                    icon={col.icon ? col.icon : null}
                    visible={col.condition ? (e) => col.condition(e.row.data) : true}
                    onClick={(e) => {
                      col.func(e.row.data);
                    }}
                  />
                ) : null}
                {col.required ? <RequiredRule /> : null}
              </Column>
            );
          })}
        <MasterDetail enabled={RowDetails != null} component={RowDetails} />
        {(allowDelete || allowUpdate) && (
          <Column type="buttons" width={70}>
            <Button name="edit" />
            <Button name="delete" />
          </Column>
        )}
        <Export enabled={allowExcel} allowExportSelectedData={true} />

        <Summary>
          {summaryItems.map((item, index) => {
            return (
              <TotalItem
                key={index}
                column={item.column}
                summaryType={item.summaryType}
                valueFormat={item.valueFormat}
                showInColumn={item.showInColumn}
                cssClass={item.cssClass}
                skipEmptyValues={true}
                customizeText={item.customizeText}
              />
            );
          })}
          {tableGroupSummary.map((groupItem) => {
            return (
              <GroupItem
                column={groupItem.column}
                summaryType={groupItem.summaryType}
                showInGroupFooter={groupItem.showInGroupFooter}
                displayFormat={groupItem.displayFormat}
                alignByColumn={groupItem.alignByColumn}
                showInColumn={groupItem.showInColumn}
              />
            );
          })}
        </Summary>
      </DataGrid>
    </React.Fragment>
  );
}

const onExportingHandle = (e) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Main sheet");

  exportDataGrid({
    component: e.component,
    worksheet: worksheet,
    autoFilterEnabled: true,
  }).then(() => {
    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(
        new Blob([buffer], { type: "application/octet-stream" }),
        "DataGrid.xlsx"
      );
    });
  });
  e.cancel = true;
};

export default React.memo(MasterTable);
