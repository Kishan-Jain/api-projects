const asyncHandler = async function(requestHandler){
    return  (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((error) => (next(error)))
    }
} 

export default asyncHandler
