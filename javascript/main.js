'use strict';

/* 
* Данная реализация написана в 2018 году по фриланс-заказу
* Вся чувствительная информация заменена заглушками
*/

// global helper functions
function isMobilePlatform() {
	if (navigator.userAgent.match(/Android/i)
		|| navigator.userAgent.match(/webOS/i)
		|| navigator.userAgent.match(/iPhone/i)
		|| navigator.userAgent.match(/iPad/i)
		|| navigator.userAgent.match(/iPod/i)
		|| navigator.userAgent.match(/BlackBerry/i)
		|| navigator.userAgent.match(/Windows Phone/i)
	) {
		return true;
	}
	else {
		return false;
	}
}

// очищает от недопустимых символов
function sanitize(text) {
	return text.replace(/<(|\/|[^\/>][^>]+|\/[^>][^>]+)>/g, '');
}

function getPureVal(val) {
	const split = /([\+\-]?[0-9#\.]+)(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val);
	if (split) return Number(split[1]);
}

// crossbrowser version
function getCoords(elem) {
	let box = elem.getBoundingClientRect();

	let body = document.body;
	let docEl = document.documentElement;

	let scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
	let scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

	let clientTop = docEl.clientTop || body.clientTop || 0;
	let clientLeft = docEl.clientLeft || body.clientLeft || 0;

	let top = box.top + scrollTop - clientTop;
	let left = box.left + scrollLeft - clientLeft;

	return { top: Math.round(top), left: Math.round(left) };
}

// Вырезает из указанного массива указанный элемент
function cutFrom(array, target) {
	let position = array.indexOf(target);
	array.splice(position, 1);
}

function ifIntersection({ targets, cbOnTrue, cbOnFalse }) {
	let firstElement = targets[0];
	let secondElement = targets[1];

	let style1 = getComputedStyle(firstElement);
	let style2 = getComputedStyle(secondElement);

	let scrollHeight = Math.max(
		document.body.scrollHeight, document.documentElement.scrollHeight,
		document.body.offsetHeight, document.documentElement.offsetHeight,
		document.body.clientHeight, document.documentElement.clientHeight
	);

	let m = parseInt(scrollHeight - document.documentElement.clientHeight);
	let heigh1 = window.pageYOffset;
	let heigh2 = m - parseInt(style2.height);

	if (heigh1 > heigh2) {
		cbOnTrue();
	} else {
		cbOnFalse();
	}
}

function toggleBottomFix(ref, state) {
	if (ref) {
		if (state === true) {
			ref.classList.add('bottom-fix');
		} else if (state === false) {
			ref.classList.remove('bottom-fix');
		}
	}
}

// Главный класс
// содержит оснвоную логику скрипта
class Page {
	constructor() {
		this.currentPage = null;

		this.body = document.body;

		this.process = {
			header: {
				expanded: false,
			},

			services: {
				main: null,

				additional: {
					selected: [],
					transport: document.getElementById('additional_services_chosen_transport'),
				},
			},
		}

		this.UI = {
			header: {
				body: document.getElementById('header'),
				minimize_handler: document.getElementById('header_menu_handler')
					? document.getElementById('header_menu_handler').children[0]
					: null,

				// "Раскрывает" меню сайта или закрывает её
				expand: (state) => {
					let header = this.UI.header.body;
					let menu_list = document.querySelector('#header .menu');

					if (state === true) {
						this.process.header.expanded = true;

						header.classList.add('header-expanded');
						header.children[1].classList.add('header-expanded');
						menu_list.classList.remove('hidden');
					} else if (state == false) {
						this.process.header.expanded = false;

						header.classList.remove('header-expanded');
						header.children[1].classList.remove('header-expanded');
					}
				},

				// Адаптирует элементы меню под минимизированный вид
				transformItemsView: (state) => {
					let menu_list = document.querySelector('#header .menu');

					for (let i = 0; i < menu_list.children.length; i++) {
						let item = menu_list.children[i].children[0];

						if (state == true) {
							item.classList.add('menu-list-adapted');
						} else if (state == false) {
							item.classList.remove('menu-list-adapted');
						}

						menu_list.classList.remove('hidden');
					}
				},

				headerTransformableView: () => {
					if (this.UI.header.minimize_handler) {
						this.UI.header.minimize_handler.addEventListener('click', () => {
							if (this.process.header.expanded === false) {
								this.UI.header.expand(true);
							} else {
								this.UI.header.expand(false);
							}
						});
					}
				},
			},

			business_card: {
				body: document.getElementById('business_card_container'),

				card: {
					isHidden: false,
					body: document.getElementById('business_card'),
					showOrHide: action => {
						function replaceFASymbol(ref, className) {
							ref.children[0].className = '';
							ref.children[0].className = className;
						}

						let card = this.UI.business_card.card.body;
						let handler = this.UI.business_card.handler.body

						if ((action && action == "show") || this.UI.business_card.card.isHidden === true) {
							card.classList.remove('hidden');
							this.UI.business_card.card.isHidden = false;
							this.UI.business_card.handler.moveToBottom(false);
							replaceFASymbol(handler, 'fas fa-times')
						} else if ((action && action == "hide") || this.UI.business_card.card.isHidden === false) {
							card.classList.add('hidden');
							this.UI.business_card.card.isHidden = true;
							this.UI.business_card.handler.moveToBottom(true);
							replaceFASymbol(handler, 'fas fa-phone');
						}
					},
				},

				handler: {
					body: document.getElementById('business_card_handler'),
					moveToBottom: state => {
						let elem = this.UI.business_card.handler.body;

						if (state === true) {
							elem.style.top = 90 + 'px';
							elem.style.padding = '11px 14px';
						} else if (state === false) {
							elem.style.padding = '9px 14px';
							elem.style.top = -21 + 'px';
						}
					},
				}
			},

			services: {
				main: {
					get: document.getElementsByClassName('service_option'),
					select: index => {
						const options = this.form.body.querySelector('#service_selector');
						options.children[index].setAttribute('selected', 'true');

						// После выбора услуги - авто скролл до формы заказа
						this.scrollTo(this.form.body);
					},
				},

				additional: {
					get: document.getElementsByClassName('additionl_service_option'),
					getOptionName: index => {
						let option = this.UI.services.additional.get[index];
						return option.children[0].textContent;
					},

					select: index => {
						index = index + '';

						// Проверяем наличие выбора в списке выбранного
						let isAlreadySelected = this.process.services.additional.selected.includes(index);

						// Отсекаем дубликат по выбору
						if (isAlreadySelected == false) {
							const option = this.UI.services.additional.get[index],
								name = this.UI.services.additional.getOptionName(index);

							const options_container = this.form.body.querySelector('#additional_services_chosen');
							options_container.classList.remove('hidden');

							let selected_option = document.createElement('li');
							let option_label = document.createElement('div');
							let option_checkbox = document.createElement('input');

							selected_option.classList.add('option');
							option_label.innerHTML = name;

							option_checkbox.setAttribute('type', 'checkbox');
							option_checkbox.setAttribute('checked', '');
							option_checkbox.addEventListener('click', () => {
								let selected_array = this.process.services.additional.selected;

								this.UI.services.additional.deselect(
									this, selected_array,
									index, selected_option
								);
							});

							selected_option.appendChild(option_label);
							selected_option.appendChild(option_checkbox);

							options_container.children[1].appendChild(selected_option);

							// Регестрируем в массиве свой выбор						
							this.process.services.additional.selected.push(index);
							this.process.services.additional.transport.value += name + ', ';
						}
					},

					deselect: function (self, selected_array, index, elementRef) {
						cutFrom(selected_array, index);
						elementRef.remove();

						const container = self.form.body.querySelector('#additional_services_chosen');

						if (selected_array.length == 0) container.classList.add('hidden');
					},
				},
			}
		};

		this.form = {
			body: document.getElementById('order_form'),

			// Валидация полей
			validateValue: (text, type) => {
				let result = false;

				switch (type) {
					case "name":
						result = !/([a-zA-Z]|[0-9])/gm.test(text);
						break;

					case "rus_number":
						let length_test;

						if (/(^7|^8)/.test(text)) length_test = text.length < 12 ? true : false;
						let regex_test = !/([a-zA-Z]|[а-яёА-ЯЁ])/gm.test(text);

						if (regex_test === true && length_test === true) result = true;
						break;

					default:
						return false;
						break;
				}

				return result;
			},

			protectFields: () => {
				// Блокирует ввод, отрезая всё от начала и до предпоследнего символа
				function blockTyping(blockingInputRef, cleaned_value) {
					blockingInputRef.value = cleaned_value.substring(0, blockingInputRef.value.length - 1);
				}

				const form = this.form.body;

				let fields = form ? form.querySelectorAll('input') : false;

				if (form && fields) {
					for (let i = 0; i < fields.length; i++) {
						let field = fields[i];

						field.addEventListener('input', () => {
							let cleaned_value = sanitize(field.value);

							if (field.getAttribute('name') == "customer_name") {
								if (this.form.validateValue(field.value, 'name') === false) {
									// Если не прошло валидацию - заблокировать ввод
									blockTyping(field, cleaned_value);
								}
							} else if (field.getAttribute('name') == "customer_phone_number") {
								if (this.form.validateValue(field.value, 'rus_number') === false) {
									// Если не прошло валидацию - заблокировать ввод
									blockTyping(field, cleaned_value);
								}
							};
						});
					}
				}
			},

			bindWithServices: () => {
				let main = this.UI.services.main.get;
				let additional = this.UI.services.additional.get;

				for (let i = 0; i < main.length; i++) {
					let item = main[i];

					item.getElementsByClassName('button')[0].addEventListener('click', () => {
						this.UI.services.main.select(i);
					});
				}

				for (let j = 0; j < additional.length; j++) {
					let item = additional[j];

					item.getElementsByClassName('button')[0].addEventListener('click', () => {
						this.UI.services.additional.select(j);
					});
				}
			},
		}
	};

	getScreenWidth() {
		return document.documentElement.clientWidth;
	}

	// Проскроллить до определённого элемента
	scrollTo(element) {
		// Чтобы нужный нам блок оставался в центре экрана
		let halfHeight = getPureVal((getComputedStyle(element).height)) * 0.5,
			y = getPureVal(getCoords(element).top) - halfHeight;
		if (isMobilePlatform()) y = y + 280;

		setTimeout(window.scrollTo(0, y), 100);
	};

	detectLocation() {
		let match = document.URL.match(/\/[a-zA-Z\-\_]+\.html/g);
		this.currentPage = Array.isArray(match) && match.length > 0 ? match[0] : null;
	}
}

function responsiveScreen(application) {
	let w = application.getScreenWidth();

	if (w < 920) {
		application.UI.header.transformItemsView(true);
	} else {
		application.UI.header.transformItemsView(false);
	}

	application.UI.header.expand(false);
}

// При загрузке страницы инициализовать работу скрипта
window.addEventListener('load', () => {
	let Landing = new Page();
	Landing.detectLocation();

	// Допустимые адреса к срабатыванию анимации карточки контактов
	let isInteractivePage = Landing.currentPage == '/main.html' || Landing.currentPage == '/all_services.html';

	// Управление минимизированным меню
	Landing.UI.header.headerTransformableView();

	// Защищаем поля от ввода вних недопустимых символов
	Landing.form.protectFields();

	// Связываем форму и сервисы, выбор услуги отображается в форме
	Landing.form.bindWithServices();

	if (isInteractivePage) {
		if (Landing.getScreenWidth() < 700) {
			Landing.UI.business_card.card.showOrHide('hide');
		}

		Landing.UI.business_card.handler.body.addEventListener('click', () => {
			Landing.UI.business_card.card.showOrHide();
		});
	}

	// релаизуем некоторую адаптивность через сркипт
	responsiveScreen(Landing);

	// Логируем состояние главноего объекта
	console.log(Landing);


	// при событии "изменении размера окна"
	window.addEventListener('resize', () => {
		responsiveScreen(Landing);
	});

	// Контроль пересечений элементов при событии скроллинга
	window.addEventListener('scroll', () => {
		ifIntersection({
			targets: [Landing.UI.business_card.body, document.getElementById('footer')],
			cbOnTrue: () => { toggleBottomFix(Landing.UI.business_card.body, true) },
			cbOnFalse: () => { toggleBottomFix(Landing.UI.business_card.body, false) },
		});
	});
});