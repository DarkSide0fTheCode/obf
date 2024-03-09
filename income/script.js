$(function() {

  let canExit = true
  var armSFX = new Audio('./assets/arm-SFX.mp3');

  window.addEventListener('message', function(event) {
		var data = event.data;
    console.log(data.action)
		if (data.action === "handleUI"){
			handleDisplay(data.status);
		} else if (data.action === "startGrab") {
      grabDrink(data.drink)
		} else if (data.action === "setupUI") {
      setupUI(data.payload)
    }
	})

  window.addEventListener("keydown", (e) => {
    e.preventDefault()
    if (e.key === "Escape" && canExit === true) { closeUI(); }
  });

  setupUI = function(data) {
    console.log("SETUP UI 2")
    for (const [key, value] of Object.entries(data.Prices)) {
      // console.log(`${key}: ${value}`);
      console.log("Price of "+ `${key}` + " is " + priceFomat(value.Price, "$"))
      let targetId = key+ "-price"
      let priceLabel = priceFomat(value.Price, "$")
      $("#" + targetId).text(priceLabel)
    }
    $("#choose-drink-help").text(data.Labels["choose_drink"])
    $("#get-drink-help").text(data.Labels["get_drink"])
    // $('.machine-container').text("");

  }
  
  closeUI = function() {
    $('.machine-container').fadeOut(300);
    $.post(`https://mbt_drink_machine/closeUI`, JSON.stringify({}));
  }

  handleDisplay = function(display) {
    if (display === true) {
      $('.machine-container').fadeIn(300);
    } else {
      $('.machine-container').fadeOut(300);
      resetArmSFX()
    }
  }

  clearClasses = function () {
    $('.shelf-bottles-moving').removeClass('moving-bottles');
    $('.machine-container').removeClass('grapping-bottle');
    $('.machine-container').removeClass(function (index, css) {
        return (css.match (/(^|\s)grab-bottle[^\s$]+/g) || []).join(' ')+ ' grapping-bottle';
    });
  };

  grabDrink = function(drinkType) {
    canExit = false
    console.log("drinkType " + drinkType)
    playArmSFX();
    setTimeout(function() {
      $('.machine-container').addClass('grab-bottle-' + drinkType + ' grapping-bottle');
      $('.moving-' + drinkType).addClass('moving-bottles');
    }, 3200);
  }

  function priceFomat(n, currency) {
    return currency + n.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
  }  

  function playArmSFX() {
    armSFX.play();
    armSFX.volume = 0.1;
  }

  function resetArmSFX() {
    armSFX.pause;
    armSFX.currentTime = 0;
    armSFX.load()
  }

  // Activate Coke Bottle
  $('.activator-coke').click(function() {
    if (canExit === true) {
      clearClasses();
      $.post(`https://mbt_drink_machine/checkPrice`, JSON.stringify({drink: "coke"}));
    }
    

    // setTimeout(function() {
    //   $('.machine-container').addClass('grab-bottle-coke grapping-bottle');
    //   $('.moving-coke').addClass('moving-bottles');
    // }, 10);
  });

  // Activate Sprite Bottle
  $('.activator-sprite').click(function() {
    if (canExit === true) {
      clearClasses();
      $.post(`https://mbt_drink_machine/checkPrice`, JSON.stringify({drink: "sprite"}));
    }
    // setTimeout(function() {
    //   $('.machine-container').addClass('grab-bottle-sprite grapping-bottle');
    //   $('.moving-sprite').addClass('moving-bottles');
    // }, 10);
  });

  // Activate fanta Bottle
  $('.activator-fanta').click(function() {
    if (canExit === true) {
    clearClasses();
      console.log("fanta clicked")
      $.post(`https://mbt_drink_machine/checkPrice`, JSON.stringify({drink: "fanta"}));
    }


    // setTimeout(function() {
    //   $('.machine-container').addClass('grab-bottle-fanta grapping-bottle');
    //   $('.moving-fanta').addClass('moving-bottles');
    // }, 10);
  });

  // Activate Water Bottle
  $('.activator-water').click(function() {
    if (canExit === true) {
      clearClasses();
      console.log("fanta clicked")
      $.post(`https://mbt_drink_machine/checkPrice`, JSON.stringify({drink: "water"}));
    }

    // setTimeout(function() {
    //   $('.machine-container').addClass('grab-bottle-water grapping-bottle');
    //   $('.moving-water').addClass('moving-bottles');
    // }, 10);
  });

  // Open Coke Overlay
  $('.bottle-coke').click(function() {
    clearClasses();
    $.post(`https://mbt_drink_machine/takeDrink`, JSON.stringify({drink: "coke"}));
    canExit = true
    
    // $(this).addClass('hide-bottle');
    // $('.machine-overlay').addClass('active');
    // $('.machine-overlay-coke').addClass('active');

    // setTimeout(function() {
    //   $('.machine-overlay').removeClass('active');
    //   $('.bottle-coke').removeClass('hide-bottle');
    //   $('.machine-overlay-inner').removeClass('active');
    // }, 5000);
     // Linear interpolation helper

    // Activates SMIL animation when the bottle is clicked
    // This part is the only way to make the filling animation.
    // var cokeFill = document.getElementById('cokeFillAnimation');
    // cokeFill.beginElement();
  });

  // Open Coke Overlay
  $('.bottle-sprite').click(function() {
    clearClasses();
    $.post(`https://mbt_drink_machine/takeDrink`, JSON.stringify({drink: "sprite"}));
    canExit = true



    // $(this).addClass('hide-bottle');
    // $('.machine-overlay').addClass('active');
    // $('.machine-overlay-sprite').addClass('active');

    // setTimeout(function() {
    //   $('.machine-overlay').removeClass('active');
    //   $('.bottle-sprite').removeClass('hide-bottle');
    //   $('.machine-overlay-inner').removeClass('active');
    // }, 5000);

    // // Activates SMIL animation when the bottle is clicked
    // // This part is the only way to make the filling animation.
    // var spriteFill = document.getElementById('spriteFillAnimation');
    // spriteFill.beginElement();
  });

  // Open Coke Overlay
  $('.bottle-fanta').click(function() {
    clearClasses();
    $.post(`https://mbt_drink_machine/takeDrink`, JSON.stringify({drink: "fanta"}));
    canExit = true


    // $(this).addClass('hide-bottle');
    // $('.machine-overlay').addClass('active');
    // $('.machine-overlay-fanta').addClass('active');

    // setTimeout(function() {
    //   $('.machine-overlay').removeClass('active');
    //   $('.bottle-fanta').removeClass('hide-bottle');
    //   $('.machine-overlay-inner').removeClass('active');
    // }, 5000);

    // // Activates SMIL animation when the bottle is clicked
    // // This part is the only way to make the filling animation.
    // var fantaFill = document.getElementById('fantaFillAnimation');
    // fantaFill.beginElement();
  });

  // Open Coke Overlay
  $('.bottle-water').click(function() {
    clearClasses();
    $.post(`https://mbt_drink_machine/takeDrink`, JSON.stringify({drink: "water"}));
    canExit = true
  });

});
