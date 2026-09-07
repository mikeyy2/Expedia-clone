import { listThingsToDo } from '../../api/firestore';
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DestinationCard from './DestinationCard';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer'

import {Grid,Box,Center} from '@chakra-ui/react';


export const Destination = () => {
  const [places,setPlaces] = useState([])
  const [searchParams] = useSearchParams()
 
  let place = searchParams.get("place")
  
  
  useEffect(()=>{
    listThingsToDo(place)
      .then((rows) => setPlaces(rows))
      .catch((err) => console.error("fetch things to do failed", err));
  },[place])
 
 
  return (

    
      <>
      
        <Center>
      
      <Grid templateColumns={{ base: 'repeat(1, 1fr)',  md: 'repeat(2, 1fr)',lg:'repeat(3, 1fr)'} } columnGap={20} rowGap={20} mt={"60px"}>
       {places.map((el)=>(<DestinationCard key={el.id} image={el.image} title={el.title} price={el.price} rating={+el.rating ? +el.rating : 0} place={el.place}/>
        ))}
        </Grid>
    
  </Center>
   
      
      
      </>
      
  )
}