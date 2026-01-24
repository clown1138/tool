'use client';

// import { useSelector, useDispatch } from 'react-redux';
// import { increment, decrement, incrementByAmount } from '../../lib/features/counterSlice';

// export default function CounterPage() {
//   console.log((state) => state.counter.value,'state')
//   const count = useSelector((state) => state.counter.value);
//   const dispatch = useDispatch();

//   return (
//     <div style={{ padding: '20px', textAlign: 'center' }}>
//       <h1>Next.js + Redux 計數器</h1>
//       <p style={{ fontSize: '2rem' }}>當前數值: {count}</p>
      
//       <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
//         <button onClick={() => dispatch(increment())}>+1</button>
//         <button onClick={() => dispatch(decrement())}>-1</button>
//         <button onClick={() => dispatch(incrementByAmount(10))}>+10</button>
//       </div>
//     </div>
//   );
// }
import React, { useState } from 'react';
import TattooHandAR from '../../components/TattooHandAR'
const TodoList = () => {
 return (
    <TattooHandAR/>
    );
};

export default TodoList;
