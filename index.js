$(function() {
    "use strict";

    function PasswordStrengthCalculator() {

        function passwordContainsLowercaseLetter(value) {
            return (/[a-z]/).test(value);
        }

        function passwordContainsUppercaseLetter(value) {
            return (/[A-Z]/).test(value);
        }

        function passwordContainsSpaces(value) {
            return (/ /).test(value);
        }

        function passwordContainsNumber(value) {
            return (/[0-9]/).test(value);
        }

        function passwordContainsSymbol(value) {
            var containsSymbol = false,
                symbols = "-!§$%&/()=?.:,~;'#+-/*\\|{}[]_<>\"".split("");

            $.each(symbols, function(index, symbol) {
                if (value.indexOf(symbol) > -1) {
                    containsSymbol = true;

                    // We found a symbol. Therefore, return false to exit $.each early (short-circuit).
                    return false;
                }
            });

            return containsSymbol;
        }

        function countSpaces(value) {
            return value.split(/ +/).length - 1;
        }

        return {
            calculate: function(value, points) {
                var score = value.length * points.forEachCharacter;

                if (passwordContainsSpaces(value)) { score += countSpaces(value) * points.forEachSpace; }
                if (passwordContainsLowercaseLetter(value)) { score += points.containsLowercaseLetter; }
                if (passwordContainsUppercaseLetter(value)) { score += points.containsUppercaseLetter; }
                if (passwordContainsNumber(value)) { score += points.containsNumber; }
                if (passwordContainsSymbol(value)) { score += points.containsSymbol; }

                return score;
            }
        };
    }

    function Indicator(indicator, settings) {
        var $indicator = $(indicator).hide();

        function getStrengthClass(score) {
            var strengthIndex = parseInt(Math.round(score * (settings.strengthClassNames.length - 1) * 100 / settings.secureStrength) / 100, 10);
            if (strengthIndex >= settings.strengthClassNames.length) {
                strengthIndex = settings.strengthClassNames.length - 1;
            }

            return settings.strengthClassNames[strengthIndex];
        }

        return {
            refresh: function(score) {
                if (score > 0) {
                    $indicator.css("display", settings.indicatorDisplayType);
                } else {
                    $indicator.hide();
                }

                var strengthClass = getStrengthClass(score);
                $.each(settings.strengthClassNames, function(index, value) {
                    $indicator.removeClass(value.name);
                });
                $indicator.addClass(strengthClass.name);

                if (settings.text) {
                    $indicator.text(strengthClass.text);
                }
            }
        };
    }

    var calculator,
        defaults = {
            secureStrength: 25,

            $indicator: undefined,
            indicatorClassName: "password-strength-indicator",
            indicatorDisplayType: "contents",
            text: true,

            points: {
                forEachCharacter: 1,
                forEachSpace: 1,
                containsLowercaseLetter: 2,
                containsUppercaseLetter: 2,
                containsNumber: 4,
                containsSymbol: 5
            },

            strengthClassNames: [{
                name: "very-weak",
                text: "Very Weak"
            }, {
                name: "weak",
                text: "Weak"
            }, {
                name: "mediocre",
                text: "Mediocre"
            }, {
                name: "strong",
                text: "Strong"
            }, {
                name: "very-strong",
                text: "Very Strong"
            }]
        },

        methods = {
            init: function(options) {
                var settings = $.extend({}, defaults, options),
                    $input = $(this),
                    $indicator = getIndicatorElement($input, settings),
                    indicator = new Indicator($indicator, settings);

                setupAutomaticIndicatorRefresh(indicator, $input, settings);

                return $input;
            },

            calculate: function(value, options) {
                var settings = $.extend(defaults, options);

                if (!calculator) {
                    calculator = new PasswordStrengthCalculator();
                }

                return calculator.calculate(value, settings.points);
            },

            defaults: function() {
                return defaults;
            }
        };

    function getIndicatorElement($input, settings) {
        var $indicator = settings.$indicator || $("<span>&nbsp;</span>").insertAfter($input);

        return $indicator.attr("class", settings.indicatorClassName);
    }

    function setupAutomaticIndicatorRefresh(indicator, $input, settings) {
        var refresh = function() {
            var password = $input.val(),
                score = methods.calculate(password, settings);

            indicator.refresh(score);
        };

        $input.on("keyup", refresh);
    }

    $.fn.passwordStrengthIndicator = $.fn.passwordStrength = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }

        if (typeof method === "object" || !method) {
            return methods.init.apply(this, arguments);
        }

        $.error("Method " +  method + " does not exist on jQuery.passwordStrength");
    };
});

$(document).ready(function(){
    var outputTarget = $("#pb");
    var strength=-1;
     function checkPasswordStrength(password){
            var strength = 0;
            if(password.length>=4&&password.length<=6){
                strength+=1;
            }
            if(password.length>6&&password.length<=8){
                strength+=1;
            }
            if(password.length>8){
                strength+=1;
            }
            if(password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)){
                strength+=1;
            }
            if(password.match(/([A-Z])/)){
                strength+=1;
            }
            if(password.match(/([0-9])/)){
                strength+=1;
            }
            if(password.match((/.[!,@,#,$,%,^,&,*,?,_,~,-,(,)]/))){
                strength+=1;
            }
            return strength;
       }
        $("#password").keyup(function(){
            strength = checkPasswordStrength($("#password").val());
            outputTarget.removeClass(function (index, css) {
                      return (css.match (/\level\S+/g) || []).join(' ');
              });
            if($("#password").val()==""){
                strength=-1;
            }
            outputTarget.addClass('level'+strength);
            $("#l").text("Strenth Level: "+strength);
        });
});
WebFont.load({
  google: {
   families: ["Lato:100,300,400,700,900","Karla:regular","Cookie:regular"]  }
  });

  $(function() {
      $("#password").passwordStrength();
  });
