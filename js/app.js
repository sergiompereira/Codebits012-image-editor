

function ImageEditor(){
	
	// Initialise variables
	var wrapper = $("#editorWrapper");
	
	var editor = document.getElementById("editorImage");
	var editorCtx = editor.getContext("2d");
	var tempEditor;
	var tempEditorCtx;
	
	var image;
	var imageWidth;
	var imageHeight;
	
	var avatarWidth;
	var avatarHeight;
	
	var move = false;
	var drag = false;
	var imageOffsetX = 0;
	var imageOffsetY = 0;
	var mouseX = 0;
	var mouseY = 0;
	
	var centerRatioX = 0;
	var centerRatioY = 0;
	
	var inputSize = $("#inputSize");
	var saturation = $("#saturation");
	var brightness = $("#brightness");
	var contrast = $("#contrast");
	var buttonSave = $("#buttonSave");
	var red = $("#red");
	var green = $("#green");
	var blue = $("#blue");
	var sharpen = $("#sharpen");
	var blur = $("#blur");
	var emboss = $("#emboss");
	
	var filtersWorker = new Worker('js/webworkers/filtersWorker.js');
	var processStack = {};
	var runningFilter = "";
	var canvasBitmapData;
	var imageData;
	var preloader;
		
	// Load image into editor
	function loadImage(imageURL) {
		image = new Image();
		image.src = imageURL;
		$(image).load(function(e){
			imageWidth = image.width;
			imageHeight = image.height;
			//centers and draws the image
			imageOffsetX = -(imageWidth/2-editor.width/2);
			imageOffsetY = -(imageHeight/2-editor.height/2);
			
			//saves the x and y position of the image point at the center of the canvas in proportion to the image size
			//it will be used bellow to correctly handle the resize without displacing the image from the current focus point
			centerRatioX = (-imageOffsetX + editor.width/2)/imageWidth;
			centerRatioY = (-imageOffsetY + editor.height/2)/imageHeight;
			
			
			//default setting
            handleSize(25);
			//drawImage(); //already done by handleSize
			storeData();
			
			canvasBitmapData = new smp.canvas.CanvasBitmapData();
			var tCanvas = document.createElement("canvas");
			
			filtersWorker.postMessage({"action":"init"});
			filtersWorker.onmessage = function (event) {
				if(event.data.type == "debug"){
					smp.log(event.data.message);
				}else{
					onWorkersResponse(event.data.bmpData);
				}
				
			};
            
			preloader = $(document.createElement("div"));
			preloader.addClass("preloader");
			preloader.append(new smp.ui.WedgePreloader(50,25,"#ffffff",20,5,2));
			wrapper.append(preloader);
			preloader.hide();
		})
	};
	
	
	function drawImage(){
		editorCtx.clearRect(0,0,editor.width, editor.height);
		editorCtx.drawImage(image,imageOffsetX, imageOffsetY, imageWidth, imageHeight);
		
	}
	function storeData(){
		imageData = editorCtx.getImageData(0,0,editor.width, editor.height);
	}
	
	function handleSliders(filterName,filterValue){
		
		console.log("handle slide: "+filterValue);
		//console.dir(processStack);		
		
		
		if(filterName == "saturation" || filterName == "brightness" ||  filterName == "constrast"  || filterName == "red"  || filterName == "green"  || filterName == "blue" ){
			if (filterValue == 1){
				filtersWorker.postMessage({'action':'resetFilter', 'filter':filterName});
				applyFilters();
				return;
			}
		}else
		if(filterName == "sharpen" || filterName == "blur" ||  filterName == "emboss"){
			if (filterValue == 0){
				filtersWorker.postMessage({'action':'resetFilter', 'filter':filterName});
				applyFilters();
				return;
			}else{
				switch(filterName){
					case "sharpen":
						filtersWorker.postMessage({'action':'resetFilter', 'filter':"blur"});
						filtersWorker.postMessage({'action':'resetFilter', 'filter':"emboss"});
						updateLabel("blur");
						updateLabel("emboss");
						break;
					case "blur":
						filtersWorker.postMessage({'action':'resetFilter', 'filter':"sharpen"});
						filtersWorker.postMessage({'action':'resetFilter', 'filter':"emboss"});
						updateLabel("sharpen");
						updateLabel("emboss");
						break;
					case "emboss":
						filtersWorker.postMessage({'action':'resetFilter', 'filter':"sharpen"});
						filtersWorker.postMessage({'action':'resetFilter', 'filter':"blur"});
						updateLabel("sharpen");
						updateLabel("blur");
						break;
					
				}
			}
		}
		
		if(runningFilter == ""){
			console.log("free to go");
			runningFilter = filterName;
			preloader.show();
			applyFilters(filterName, filterValue);
		}else{
			console.log("wait");
			processStack[filterName] = filterValue;
		}
		
	}
	
	function onWorkersResponse(imageData){
		
		console.log("on worker response:");
		//console.log(processStack);
		
		//check waiting list
		var stackEmpty = true;
		for(var key in processStack){
			if(processStack[key] != null && processStack[key] != undefined){
				//if there are stacked processes, do not render yet
				console.log("go to next");
				stackEmpty = false;
				applyFilters(key, processStack[key]);
				processStack[key] = undefined;
				runningFilter = key;
				break;
			} 
		}
		if(stackEmpty){
			preloader.hide();
			runningFilter = "";
			//if no process waiting, render and rest.
			//apply process output
			editorCtx.putImageData(imageData,0,0);
		}
	}
	
	function applyFilters(filterName, filterValue){
		var emptyBmpData = canvasBitmapData.createBitmapData(avatarWidth, avatarHeight);
		filtersWorker.postMessage({'action':'applyFilters', 'filter':filterName , 'filterValue':filterValue , 'bmpData':imageData,  'emptyBmpData':emptyBmpData});

	}
	

	
	// Editor event handlers
	$(wrapper).mousedown(function(e) {
		move = true;
		//gets the left and top position relative to the page of the matching element (if absolutely positioned)
		var editorOffset = $(this).offset();
		//gets the mouse position relative the the canvas
		mouseX = Math.floor(e.pageX-editorOffset.left);
		mouseY = Math.floor(e.pageY-editorOffset.top);
	});
	
	$(wrapper).mousemove(function(e) {
		if(move){
			drag = true;
			var editorOffset = $(this).offset();
			var currentMouseX = Math.floor(e.pageX-editorOffset.left);
			var currentMouseY = Math.floor(e.pageY-editorOffset.top);
			imageOffsetX += currentMouseX-mouseX;
			imageOffsetY += currentMouseY-mouseY;
			
			//draw the plain image and store
			drawImage();
			//avoid processing filters on mouse move
			//handleSliders();
			
			mouseX = Math.floor(e.pageX-editorOffset.left);
			mouseY = Math.floor(e.pageY-editorOffset.top);
		}
	});
	
	
	$(wrapper).mouseup(function(e) {
		move = false;
		if(drag){
			drag = false;
			
			//no need to redraw the image because it has been done on mouse move.
			
			//store the cropped image data
			storeData();
			//reapply filters
			handleSliders();
			
			//update the center/focus point ratio after the displacement
			centerRatioX = (-imageOffsetX + editor.width/2)/imageWidth;
			centerRatioY = (-imageOffsetY + editor.height/2)/imageHeight;
		}
		
	});
	

	// Form event handlers
	inputSize.change(function(e) {
		if(image.complete){
			
			handleSize(inputSize.val());
		}
	});
	
	inputSize.mouseup(function(e) {
		//store the cropped image data
		storeData();
		//reapply filters
		handleSliders();
	});
	
	
	
	saturation.change(function(e) {
		if(image.complete){
			
			handleSliders("saturation",saturation.val());
			updateLabel("saturation");
		}
	});
	
	brightness.change(function(e) {
		if(image.complete){
			
			handleSliders("brightness", brightness.val());
			updateLabel("brightness");
		}
	});
	
	contrast.change(function(e) {
		if(image.complete){
			
			handleSliders("contrast", contrast.val());
			updateLabel("contrast");
		}
	});
	
	red.change(function(e) {
		if(image.complete){
			
			handleSliders("red", red.val());
			updateLabel("red");
		}
	});
	green.change(function(e) {
		if(image.complete){
			
			handleSliders("green", green.val());
			updateLabel("green");
		}
	});
	blue.change(function(e) {
		if(image.complete){
			
			handleSliders("blue", blue.val());
			updateLabel("blue");
		}
	});
	sharpen.change(function(e) {
		if(image.complete){
			resetOtherAreaInputs(this);
			handleSliders("sharpen", sharpen.val());
			updateLabel("sharpen");
		}
	});
	blur.change(function(e) {
		if(image.complete){
			resetOtherAreaInputs(this);
			handleSliders("blur", blur.val());
			updateLabel("blur");
		}
	});
	emboss.change(function(e) {
		if(image.complete){
			resetOtherAreaInputs(this);
			handleSliders("emboss", emboss.val());
			updateLabel("emboss");
		}
	});
	
	function resetOtherAreaInputs(el){
		
		if(el!=sharpen.get(0)) sharpen.val(0);
		if(el!=blur.get(0)) blur.val(0);
		if(el!=emboss.get(0)) emboss.val(0);
	}
	
	function updateLabel(filtername){
		switch(filtername){
		case "saturation":
			$("#inputSaturationLabel").text("Saturação: "+Math.round(saturation.val()*10)/10);
		break;
		case "red":
			$("#inputRedLabel").text("Vermelho: "+Math.round(red.val()*10)/10);
		break;
		case "green":
			$("#inputGreenLabel").text("Verde: "+Math.round(green.val()*10)/10);	
		break;
		case "blue":
			$("#inputBlueLabel").text("Azul: "+Math.round(blue.val()*10)/10);
		break;
		case "brightness":
			$("#inputBrightnessLabel").text("Brilho: "+Math.round(brightness.val()*10)/10);
		break;
		case "contrast":
			$("#inputContrastLabel").text("Contraste: "+Math.round(contrast.val()*10)/10);
		break;
		case "sharpen":
			$("#inputSharpenLabel").text("Definição (sharpen): "+Math.round(sharpen.val()*10)/10);
		break;
		case "blur":
			$("#inputBlurLabel").text("Esbatimento (blur): "+Math.round(blur.val()*10)/10);
		break;
		case "emboss":
			$("#inputEmbossLabel").text("Relevo (emboss): "+Math.round(emboss.val()*10)/10);
		break;
		}
		
	}


	
	buttonSave.click(function(e) {
		e.preventDefault();
		saveImage();		
	});
	
	function handleSize(value)
	{
		var factor = value/100;
		imageWidth = image.width*factor;
		imageHeight = image.height*factor;
		
		/*
		imageOffsetX = -(imageWidth/2-editor.width/2);
		imageOffsetY = -(imageHeight/2-editor.height/2);
		*/
		
		/*
		 * centerRatioX = (imageOffsetX + editor.width/2)/imageWidth
		 * so with some maths we get...:
		 * */
		imageOffsetX = -(centerRatioX*imageWidth-editor.width/2);
		imageOffsetY = -(centerRatioY*imageHeight-editor.height/2);
		
		
		drawImage();
		//don't reapply filters yet, only om mouse up (see above) to avoid processing filters at such a rate!
		//handleSliders();
		
		$("#inputSizeLabel").text("Tamanho da imagem: "+inputSize.val()+"%");
	}
	
	// Save or send image from editor
	function saveImage() 
	{
		canvasBitmapData.savePNGImage(editor);
		
	};

	
	this.init = function(imageURL, width, height) {
		
		//sets the final avatar dimensions
		//shall be the same or less the canvas dimensions
		avatarWidth = width;
		avatarHeight = height;
		
		tempEditor = document.createElement("canvas");
		tempEditorCtx = tempEditor.getContext("2d");
		tempEditor.setAttribute("width", editor.width);
		tempEditor.setAttribute("height", editor.height);
		
		loadImage(imageURL);
		
	};
	
	
	this.reset = function(){
		
		saturation.val(1);
		updateLabel("saturation");
		brightness.val(1);
		updateLabel("brightness");
		contrast.val(1);
		updateLabel("contrast");
		red.val(1);
		green.val(1);
		blue.val(1);
		updateLabel("red");
		updateLabel("green");
		updateLabel("blue");
		
		sharpen.val(0);
		updateLabel("sharpen");
		blur.val(0);
		updateLabel("blur");
		emboss.val(0);
		updateLabel("emboss");
		
		filtersWorker.postMessage({'action':'resetFilters'});
		
		inputSize.val(25);
		handleSize(25);
	}
}