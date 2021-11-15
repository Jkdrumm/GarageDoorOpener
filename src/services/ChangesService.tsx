import React, { useState } from "react";
import ChangesContext from "../contexts/ChangesContext";

const ChangesService = (props: { children: React.ReactNode }) => {
  const initialState: string[] = [];
  const { children } = props;
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [numUnsavedChanges, setNumUnsavedChanges] = useState<number>(0);
  const [changedFields, setChangedFields] = useState<string[]>(initialState);

  const resetChangesStore = () => {
    setChangedFields(initialState);
    setHasUnsavedChanges(false);
    setNumUnsavedChanges(0);
  };

  const handleUnsavedChange = (
    field: string,
    value: string,
    originalValue: string
  ) => {
    const existingChange = changedFields.indexOf(field) !== -1;
    if (existingChange && value === originalValue) {
      setChangedFields(
        changedFields.filter((unsavedField: string) => unsavedField !== field)
      );
      const newNumUnsavedChanges = numUnsavedChanges - 1;
      setNumUnsavedChanges(newNumUnsavedChanges);
      if (newNumUnsavedChanges === 0) setHasUnsavedChanges(false);
    } else if (!existingChange && value !== originalValue) {
      const newNumUnsavedChanges = numUnsavedChanges + 1;
      setChangedFields([...changedFields, field]);
      setNumUnsavedChanges(newNumUnsavedChanges);
      if (!hasUnsavedChanges && newNumUnsavedChanges > 0)
        setHasUnsavedChanges(true);
    }
  };

  const submitChanges = (
    route: string,
    values: any,
    additionalParamters: any
  ) => {
    const body = {} as any;
    changedFields.forEach((field: string) => (body[field] = values[field]));
    Object.keys(additionalParamters).forEach(
      (field: any) => (body[field] = additionalParamters[field])
    );
    return fetch(`/${route}`, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((response) => {
      if (response.ok) resetChangesStore();
      return response;
    });
  };

  return (
    <ChangesContext.Provider
      value={{
        hasUnsavedChanges,
        numUnsavedChanges,
        changedFields,
        resetChangesStore,
        handleUnsavedChange,
        submitChanges,
      }}
    >
      {children}
    </ChangesContext.Provider>
  );
};

export default ChangesService;
