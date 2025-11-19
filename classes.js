class Vehicle {
  constructor(make, model){
    this.make = make
    this.model = model
    this.speed = 0
    this.isStarted = false
  }
  accelerate(){
    this.speed += 10
  }
  deccelerate(){
    this.speed -= 10
  }
  start(){
    this.isStarted = true
  }
}

class Boat extends Vehicle {
  constructor(make, model, displacement){
    super(make, model)
    this.displacement = displacement
  }
  dropAnchor(){
    console.log('Anchor was dropped!')
  }
}

class Car extends Vehicle {
  constructor(make, model, indicators){
    
  }
}
