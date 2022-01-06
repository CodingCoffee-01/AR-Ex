console.log("Starting keyboard...");

var keyboard = new Keyboard();

keyboard.setOnKeyDown(
	function(key)
	{
		if ( key == "A" )
			console.log("Callback function: A");
	}
);

loop();

function loop()
{
	requestAnimationFrame(loop);

	keyboard.update();

	// Testing with the
	if ( keyboard.isKeyDown("A") )
		console.log("Key Down: A");
	if ( keyboard.isKeyPressed("A") )
		console.log("Key Pressed: A");
	if ( keyboard.isKeyUp("A") )
		console.log("Key Up: A");
}
