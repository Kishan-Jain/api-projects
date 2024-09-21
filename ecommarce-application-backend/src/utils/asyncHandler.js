export const asyncHandler = function(requestHandler){
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((error) => (next(error)))
    }
} 

// export const asyncHandler = (requestHandler) => async (req, res, next) => {
//     try {
//         await requestHandler(req, res, next)
//     } catch (err) {
//         res.status(err.code || 500).json({
//             success : false,
//             massage : err.massage
//         })
//     }
// }