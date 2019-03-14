//note(@duncanmid): Comment Groups - Coda 2 Sidebar Plugin v.1.1 | © D.G. Midwinter, @duncanmid

//done(@duncanmid): regEx patterns

var regexStart 	= /\/\*\s*@group\s*(.*?)\s*\*\//i,
	regexEnd 	= /\/\*\s*@end\s*\*\//i,
	comment 	= /(\/\*|<!--)\s*([\s\S]*)\s*(\*\/|-->)/;



//done(@duncanmid): options

var colors = {
	'level 1': '#8363C7',
	'level 2': '#EC811D',
	'level 3': '#3893C1',
	'level 4': '#F9434A',
	'level 5': '#6FD5BB',
	'level 6': '#C268BA'
};

var parameters = {
	'use dark theme': '0'
};

var folders = Object.keys(colors),
	options = Object.keys(parameters);



//done(@duncanmid): setup (options)

function setup() {
	
	folders.forEach( function(key) {
		
		if( window.CodaPlugInPreferences.preferenceForKey(key) === undefined ) {
			window.CodaPlugInPreferences.setPreferenceForKey(colors[key], key);
		}
	});
	
	options.forEach( function(key) {
		
		if( window.CodaPlugInPreferences.preferenceForKey(key) === undefined ) {
			window.CodaPlugInPreferences.setPreferenceForKey(parameters[key], key);
		}
	});
}

setup();



//done(@duncanmid): inject style

function addStyles( rule ) {
	
	var style = document.createElement('style');
	
	if (style.styleSheet) {
	
		style.styleSheet.cssText = rule;
	
	} else {
	
		style.appendChild(document.createTextNode(rule));
	}
	
	document.getElementsByTagName('head')[0].appendChild(style);
}



//done(@duncanmid): set theme

function setTheme() {
	
	var val,
		folderrule,
		selectrule,
		level = '';
	
	$('#stylesheet').attr('href', 'styles-' + window.CodaPlugInPreferences.preferenceForKey('use dark theme') + '.css');	
	
	folders.forEach( function(key) {
	
		val = window.CodaPlugInPreferences.preferenceForKey(key);
		
		folderrule = '.folder' + level + '::before { background-color: ' + val + '; }';
		selectrule = '.folder' + level + '.selected { box-shadow: inset 0px 0px 0px 2px ' + val + '; }';
		
		addStyles( folderrule );
		addStyles( selectrule );
		
		level = level + ' > .folder';
	});
}



//done(@duncanmid): populate options

function populateOptions() {
	
	$('.labels-options').html('');
	$('.additional-options').html('');
	
	folders.forEach( function(key) {
		
		var color = window.CodaPlugInPreferences.preferenceForKey(key);
		
		$('.labels-options').append('<label><span>' + key + '</span>: <input type="text" name="' + key + '-color" style="border-color: ' + color + '" value="' + color + '" /></label>');
	});
	
	var counter = 1;
	
	options.forEach( function(key) {
		
		var checked = '';
		
		if( window.CodaPlugInPreferences.preferenceForKey( key ) == '1' ) {
			
			checked = ' checked';
		}
		
		$('.additional-options').append('<label><span>' + key + '</span><input id="option-' + counter + '" type="checkbox"' + checked + ' /></label>');
		
		counter++;
	});
}



//done(@duncanmid): update options

function updateOptions() {
	
	folders.forEach( function(key) {
	
		var value = $('input[name="' + key + '-color"]').val();
		
		if(value !== undefined) {
			window.CodaPlugInPreferences.setPreferenceForKey(value, key);
		}
	});
	
	var counter = 1;
	
	options.forEach( function(key) {
	
		if( $( '#option-' + counter ).prop('checked') === true ) {
			
			window.CodaPlugInPreferences.setPreferenceForKey('1', key);
			
		} else {
			
			window.CodaPlugInPreferences.setPreferenceForKey('0', key);
		}
		
		counter++;
	});
	
	populateOptions();
	setTheme();
}



//done(@duncanmid): CODA get document lines

function getDocumentLines() {

	var theDoc = window.CodaTextView.string(); 
	
	if ( theDoc ) {
		
		var linesArr = theDoc.split('\n');
		
		return linesArr;
	
	} else {
		
		clearAllItems();
		return null;
	}
}



//done(@duncanmid): CODA text view will save

function textViewWillSave(CodaTextView) {
	
	clearAllItems();	
	loadAllItems();
}



//done(@duncanmid): CODA text view will focus

function textViewDidFocus(CodaTextView) { 
	
	clearAllItems();	
	loadAllItems();
}



//issue: this would be ideal -- CODA text view did close
/*
function textViewDidClose(CodaTextView) {
	
	//...
}
*/



//done(@duncanmid): clear all items

function clearAllItems() {
	
	$('#main-list').html('');
}



//done(@duncanmid): parse all folders and load to list

function loadAllItems() {
	
	var lines 		= getDocumentLines(),
		lineNum 	= 1,
		itemStart 	= 0,
		charCount 	= 0,
		charStart 	= 0,
		charEnd 	= 0,
		itemTitle 	= '',
		html 		= '';
	
	if( lines ) {
	
		lines.forEach( function(message) {
			
			//note(@duncanmid): regex start
			
			if( regexStart.exec( message ) ) {
				
				var folderStart = ( regexStart.exec( message ) ),				
				itemStart 		= lineNum,
				itemTitle 		= folderStart[1],
				charStart 		= charCount;
				
				html += '<div class="folder">' +
							'<meta name="itemstart" content="' + itemStart + '" />' +
							'<meta name="charstart" content="' + charStart + '" />' +
								'<div class="item-wrap">' +
									'<div class="item">' + itemTitle + '</div>' +
								'</div>';
				
			}
			
			//note(@duncanmid): regex end
			
			if( regexEnd.exec( message ) ) {
				
				charEnd = charCount;
				var end = (message.length) + 1;
				
				html += 	'<meta name="charend" content="' + charEnd + '" />' +
							'<meta name="endlength" content="' + end + '" />' +
						'</div>';
			}
			
			charCount += (message.length + 1); //note(@duncanmid): +1 for \n char
			
			lineNum++;
		});
		
		$('#main-list').append( html );
	}
}



//note(@duncanmid): docready

$(document).ready(function() {
	
	setTheme();
	clearAllItems();
	loadAllItems();
	populateOptions();
	
	//done(@duncanmid): open options panel
	
	$('#toggle-options').click(function() {
		
		$('footer').toggleClass('revealed');
		
		if( $('footer').hasClass('revealed') ) {
			
			setTimeout(function(){
				$('#main-list').addClass('blur');
			}, 150);
		
		} else {
			
			$('#main-list').removeClass('blur');
		}
	});
	
	
	
	//done(@duncanmid): folder colors - update options
	
	$('body').on('keypress', '.labels-options input', function( event ) {
		
		//on enter (13) or tab (9)...
		if( event.keyCode == 13 || event.keyCode == 9 ) {
			
			updateOptions();
		}
	});
	
	
	
	//done(@duncanmid): stylesheet - update options
	
	$('body').on('click', '.additional-options input', function( event ) {
		
		updateOptions();
	});
	
	
	
	//done(@duncanmid):select from main list
	
	$('body').on('click', '.folder', function(e) {
		
		e.stopPropagation();
		
		var $this = $(this),
			itemstart;
		
		if( $this.hasClass('selected') ) {
			
			$('.folder').removeClass('selected');
			
			itemstart 	= parseInt( $this.find('> meta[name="itemstart"]').attr('content') );
			
			CodaTextView.goToLineAndColumn(itemstart, 0);
			
		} else {
		
			$('.folder').removeClass('selected');
			
			$this.addClass('selected');
			
			itemstart 	= parseInt( $this.find('> meta[name="itemstart"]').attr('content') );
			
			var	charstart 	= parseInt( $this.find('> meta[name="charstart"]').attr('content') ),
				charend 	= parseInt( $this.find('> meta[name="charend"]').attr('content') ),
				endlength 	= parseInt( $this.find('> meta[name="endlength"]').attr('content') );
				
			var	length = (charend - charstart) + endlength;
			
			var range= {length:length, location:charstart};
				
			CodaTextView.goToLineAndColumn(itemstart, 0);
			CodaTextView.setSelectedRange(range);
		}	
	});
	
	
	
	//done(@duncanmid): new group
	
	$('#new-group').click(function() {

		var range 	= CodaTextView.selectedRange(),
			col 	= CodaTextView.getColumn(),
			tabs 	= CodaTextView.usesTabs(),
			insert 	= '',
			text 	= '';
			
			//note(@duncanmid): tabs or spaces
			
			for(i=0; i < col; i++) {
				
				if(tabs) { insert += '\t'; } else { insert += ' '; }
			}
			
			text 	= '/* @group NewGroup */\n\n' + insert + CodaTextView.selectedText() + '\n\n' + insert + '/* @end */';
			
		CodaTextView.replaceCharactersInRangeWithString(range, text);
		
		clearAllItems();
		loadAllItems();
	});
	
	
	
	//done(@duncanmid): comment button
	
	$('.comment').click(function() {
		
		var range 		= CodaTextView.selectedRange(),
			text 		= CodaTextView.selectedText(),
			type 		= $(this).data('comment'),
			taglen;
		
			if( comment.exec( text ) ) {
	
				//note(@duncanmid): remove comment
				
				var result = text.match( RegExp(comment, 'i') );
				
				result[2] = result[2].trim();
				
				CodaTextView.replaceCharactersInRangeWithString(range, result[2]);
				
				range.length = result[2].length;
				CodaTextView.setSelectedRange(range);
				
			} else {
				
				//note(@duncanmid): add comment
				
				if(type == 'html') {
					
					text 	= '<!-- ' + text + ' -->';
					taglen 	= 9;
					
				} else {
					
					text 	= '/* ' + text + ' */';
					taglen 	= 6;
				}
				
				CodaTextView.replaceCharactersInRangeWithString(range, text);
				
				//note(@duncanmid): modify range to include comment tags...
				
				range.length = range.length + taglen;
				
				CodaTextView.setSelectedRange(range);	
			}
		
		clearAllItems();
		loadAllItems();
	});
	
	
	
	//done(@duncanmid): create sample file
	
	$('#sample').click(function() {
		
		createSampleFile();
		
		$('#toggle-options').trigger('click');
	});
	
	
	
	$('#mastodon').click( function() {
		
		window.CodaPlugInsController.displayHTMLString('<meta http-equiv="refresh" content="1;url=https://mastodon.technology/@duncanmid" />');
		
	});
});
