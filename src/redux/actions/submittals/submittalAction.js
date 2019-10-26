export const selectSubmittal = (name, number) => ({
    type: "SELECT_SUBMITTAL",
    payload: {
        submittalName: name,
        submittalNo:   number,
    }
 });
 