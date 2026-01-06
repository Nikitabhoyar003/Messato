import React from 'react'
import { useEffect } from 'react'
function App(){
  useEffect(()=>{
    fetch("http://localhost:5000/user")
    .then(res=>res.json())
    .then(data=>console.log(data))
    .catch(err=>console.log(err))
  })
  return(
    <div>

    </div>
  )
}
export default App