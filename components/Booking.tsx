import React, { useState } from 'react'
import { Switch, Text, View } from 'react-native';

const weekdays = [
        "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
    ]
    const _spacing = 0;
    const _color = "#ECECEC";
    const _borderRadius = 16;

const Day = ({day}: {day: typeof weekdays[number]}) => {
    const [isOn, setIsOn] = useState(false)
    return (
        <View>
            <View className='flex flex-row justify-between items-center'>
                <Text>{day}</Text>
                <Switch value={isOn} onValueChange={(value) => setIsOn(value)} trackColor={{ true: "#999" }}/>
            </View>
        </View>
    )
}

const Booking = () => {
  return (
    <View className='mx-4'>
      {weekdays.map((day, i) => (
        <Day
            day={day}
            key={i}
        />
      ))}
    </View>
  )
}

export default Booking
