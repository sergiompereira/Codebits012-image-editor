

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
	var buttonSave = $("#buttonSave");
	var inputs = $("input.filter-input");
	/*
	var saturation = $("#saturation");
	var brightness = $("#brightness");
	var contrast = $("#contrast");
	
	var red = $("#red");
	var green = $("#green");
	var blue = $("#blue");
	var sharpen = $("#sharpen");
	var blur = $("#blur");
	var emboss = $("#emboss");
	*/
	
	
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
		
		if(filterName == "sharpen" || filterName == "blur" ||  filterName == "emboss"){
			resetOtherAreaInputs(filterName);
			if (filterValue == 0){
				filtersWorker.postMessage({'action':'resetFilter', 'filter':filterName});
				preloader.show();
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
		}else{
			if (filterValue == 1){
				filtersWorker.postMessage({'action':'resetFilter', 'filter':filterName});
				preloader.show();
				applyFilters();
				return;
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
	
	
	inputs.each(function(ind,input){
		input = $(input);
		input.change(function(e){
			if(image.complete){
				handleSliders(input.attr("name"),input.val());
				updateLabel(input.attr("name"));
			}
		});
	});
	
	
	function resetOtherAreaInputs(filtername){
		
		if(filtername!="sharpen") inputs.filter("[name=sharpen]").val(0);
		if(filtername!="blur") inputs.filter("[name=blur]").val(0);
		if(filtername!="emboss") inputs.filter("[name=emboss]").val(0);
	}
	
	function updateLabel(filtername){
		var input = inputs.filter("[name="+filtername+"]");
		input.siblings("label").children("span").text((Math.round(input.val()*10)/10).toString());
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
		inputs.each(function(ind,input){
			input = $(input);
			var name = input.attr("name");
			if(name == "sharpen" || name == "blur" || name == "emboss"){
				input.val(0);
			}else{
				input.val(1);
			}
			updateLabel(name);
		});
		
		filtersWorker.postMessage({'action':'resetFilters'});
		
		inputSize.val(25);
		handleSize(25);
	}
}