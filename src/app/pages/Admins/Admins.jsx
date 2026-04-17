import { useCallback, useEffect, useMemo, useState } from "react";

import { DELETE_USER, EDIT_USER, GET_USERS_ADMIN, GET_BROKERS } from "./Api";
import PageLayout from "app/components/PageLayout/PageLayout";
import CrudMUI from "app/components/CrudTable/CrudMUI";

const Users = () => {
  const [brokers, setBrokers] = useState([]);
  const [isLoadingBrokers, setIsLoadingBrokers] = useState(true);

  const onEditorPreparing = useCallback((e) => {
    // Show AdminType field only when Role is "Admin"
    if (e.dataField === "AdminType") {
      const rowData = e.row?.data || e.data || {};
      const isAdmin = rowData.Role === "Admin";
      
      // Hide the entire form field (including label) if Role is not Admin
      if (!isAdmin) {
        const formItem = e.editorElement.closest(".dx-field");
        if (formItem) {
          formItem.style.display = "none";
        }
        // Clear AdminType when Role is not Admin
        if (e.setValue) {
          e.setValue(null);
        }
      } else {
        const formItem = e.editorElement.closest(".dx-field");
        if (formItem) {
          formItem.style.display = "";
        }
      }
    }
    
    // When Role changes, update AdminType visibility dynamically
    if (e.dataField === "Role") {
      const originalOnValueChanged = e.editorOptions?.onValueChanged;
      e.editorOptions.onValueChanged = (args) => {
        // Call the original handler if it exists
        if (originalOnValueChanged) {
          originalOnValueChanged(args);
        }
        
        // Update AdminType field visibility after Role changes
        setTimeout(() => {
          // Find all AdminType fields in the form and show/hide them
          const form = e.editorElement.closest("form") || e.editorElement.closest(".dx-popup-content");
          if (form) {
            const adminTypeFields = form.querySelectorAll('[data-field="AdminType"]');
            const isAdmin = args.value === "Admin";
            adminTypeFields.forEach((field) => {
              const formItem = field.closest(".dx-field");
              if (formItem) {
                formItem.style.display = isAdmin ? "" : "none";
              }
            });
            
            // Clear AdminType value if Role is not Admin
            if (!isAdmin) {
              const rowData = e.row?.data || e.data || {};
              if (rowData) {
                rowData.AdminType = null;
              }
            }
          }
        }, 50);
      };
    }
  }, []);

  useEffect(() => {
    setIsLoadingBrokers(true);
    GET_BROKERS({ pageSize: 1000, pageIndex: 0 })
      .then((res) => {
        setBrokers(res.Data || []);
      })
      .catch((error) => {
        console.error("Failed to load brokers", error);
        setBrokers([]);
      })
      .finally(() => {
        setIsLoadingBrokers(false);
      });
  }, []);

  const columnAttributes = useMemo(() => {
    return [
      {
        caption: "Id",
        field: "Id",
        captionEn: "Id",
        disable: true,
        isVisable: false,
      },
      {
        caption: "User Name",
        field: "UserName",
        captionEn: "User Name",
      },
      {
        caption: "Name",
        field: "Name",
        captionEn: "Name",
      },
      {
        caption: "Email",
        field: "Email",
        captionEn: "Email",
        type: "email",
      },
      {
        caption: "Phone Number",
        field: "PhoneNumber",
        captionEn: "Phone Number",
      },
      {
        caption: "Password",
        field: "Password",
        captionEn: "Password",
      },
      {
        caption: "Role",
        field: "Role",
        captionEn: "Role",
        type: "select",
        value: "id",
        display: "name",
        data: [
          {
            id: "Admin",
            name: "Admin",
          },
          {
            id: "User",
            name: "User",
          },
          {
            id: "Sales",
            name: "Sales",
          },
        ],
        setCellValue: (rowData, value) => {
          rowData.Role = value;
          // Clear AdminType when Role changes from Admin
          if (value !== "Admin") {
            rowData.AdminType = null;
          }
        },
      },
      {
        caption: "Admin Type",
        field: "AdminType",
        captionEn: "Admin Type",
        type: "select",
        value: "id",
        display: "name",
        data: [
          {
            id: null,
            name: "None",
          },
          {
            id: 0,
            name: "Operation",
          },
          {
            id: 1,
            name: "Finance",
          },
          {
            id: 2,
            name: "Customer Support",
          },
          {
            id: 3,
            name: "Super Admin",
          },
        ],
      },
      {
        caption: "Brokers",
        field: "BrokersIds",
        captionEn: "Brokers",
        type: "select",
        data: brokers,
        value: "Id",
        display: "Name",
        isVisable: false,
        multiple: true,
        setCellValue: (rowData, value) => {
          const normalizedValue = Array.isArray(value)
            ? value.filter((id) => id != null)
            : [];
          rowData.BrokersIds = normalizedValue;
        },
        tagBoxProps: ({ rowData }) => {
          const currentValue = rowData.BrokersIds;
          return {
            value: Array.isArray(currentValue) ? currentValue : [],
            placeholder: "Select",
            hideSelectedItems: true,
          };
        },
        onTagBoxValueChanged: ({ value, cellInfo, setValue }) => {
          const normalizedValue = Array.isArray(value)
            ? value.filter((id) => id != null)
            : [];

          setValue(normalizedValue);

          const targetRow =
            cellInfo?.row?.data ?? cellInfo?.data ?? cellInfo?.rowData ?? {};

          if (targetRow) {
            targetRow.BrokersIds = normalizedValue;
          }
        },
        calculateCellValue: (rowData) => {
          // Ensure BrokersIds is always an array for display
          if (!rowData || !rowData.BrokersIds) return "";
          const ids = Array.isArray(rowData.BrokersIds) ? rowData.BrokersIds : [];
          if (ids.length === 0) return "";
          
          // Create a map of broker IDs to names
          const brokerMap = new Map();
          if (brokers && Array.isArray(brokers)) {
            brokers.forEach((broker) => {
              if (broker?.Id != null) {
                brokerMap.set(broker.Id, broker.Name || "");
              }
            });
          }
          
          return ids
            .map((id) => brokerMap.get(id) ?? String(id))
            .filter(Boolean)
            .join(", ");
        },
      },
    ];
  }, [brokers]);


  // Don't render the table until brokers are loaded to prevent duplicate API calls
  if (isLoadingBrokers) {
    return <PageLayout>Loading...</PageLayout>;
  }

  return (
    <PageLayout>
      <CrudMUI
        id={"Id"}
        colAttributes={columnAttributes}
        EDIT={EDIT_USER}
        ADD={EDIT_USER}
        DELETE={DELETE_USER}
        GET={GET_USERS_ADMIN}
        apiKey={"Id"}
        onEditorPreparing={onEditorPreparing}
      />
    </PageLayout>
  );
};

export default Users;
