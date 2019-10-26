// import internal(own) modules

const initState = {
    submittalName: "",
    submittalNo: "",
 };
 
 const submittalReducer = (state = initState, { type, payload }) => {
    switch (type) {
       case 'SELECT_SUBMITTAL':
          return {
             ...initState,
             ...payload
          };
       default:
          return initState;
    }
 };
 
 export default submittalReducer;
 