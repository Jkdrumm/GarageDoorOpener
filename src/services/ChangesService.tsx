import React, { useState, useEffect } from "react";
import ChangesContext from "../contexts/ChangesContext";

const ChangesService = (props: { children: React.ReactNode }) => {
  const initialState: string[] = [];
  const { children } = props;
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [numUnsavedChanges, setNumUnsavedChanges] = useState<number>(0);
  const [changedFields, setChangedFields] = useState<string[]>(initialState);

  const resetChangesStore = () => {
    setChangedFields(initialState);
    setNumUnsavedChanges(0);
  };

  const handleUnsavedChange = (
    field: string,
    value: string,
    originalValue: string
  ) => {
    const existingChange = changedFields.indexOf(field) !== -1;
    console.log(
      existingChange,
      field,
      value,
      originalValue,
      value === originalValue
    );
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

  useEffect(() => {}, [changedFields]);

  return (
    <ChangesContext.Provider
      value={{
        hasUnsavedChanges,
        numUnsavedChanges,
        resetChangesStore,
        handleUnsavedChange,
      }}
    >
      {children}
    </ChangesContext.Provider>
  );
};

export default ChangesService;
