import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { LanguageService } from '../shared/language.service';
import { TranslateService } from '@ngx-translate/core';
import { NewsService } from '../shared/news.service';
import { FontFamliyService } from '../shared/font-famliy.service';
import { PapersService } from '../shared/papers.service';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { WindowService } from '../shared/window.service';
import { DomSanitizer } from '@angular/platform-browser';

import { Router } from '@angular/router';

declare let $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit, AfterViewInit {
  public headerActiveCssClass = '';
  public config: PerfectScrollbarConfigInterface = {};

  public currentLanguage = '';
  public languagesDic: any;
  public languagesDic2: any;
  public languageList = ['', ''];
  public newsList = [];
  public VideoSrc: any;
  private resizeTime: any;

  public currentEconomicPaper = '';
  private economicPapers = {};
  public currentWhitePaper = '';
  private whitePapers = {};
  private getHotNewsRetryCount = 0;
  constructor(
    private _languageService: LanguageService,
    private _newsService: NewsService,
    private _papersService: PapersService,
    private _translateService: TranslateService,
    private _cookieService: CookieService,
    public _fontFamlily: FontFamliyService,
    private _windowRef: WindowService,
    private sanitizer: DomSanitizer,
    public router: Router) {
  }

  ngOnInit() {
    this._languageService
      .getLanguageConfig()
      .subscribe(data => {
        this.languagesDic = data["languagesDic1"];
        this.languagesDic2 = data["languagesDic2"];
        this.languageList = data["languageOptions"];
        this.currentLanguage =
          data["languagesDic2"][
            this._languageService.getWebPageCurrentLanguage()
            ];
        this._fontFamlily.changeFontFamily(
          this.currentLanguage
        );
        this.setVideo();
        this.getHotNews();

        this.getEconomicPapers();
        this.getWhitepapers();
      });

    this.router.events
      .subscribe((event) => {
        $(window).scrollTop(0);
      });

    this._translateService.onLangChange.subscribe(data => {
      this.OnChange(this.languagesDic2[data.lang] || 'English');
    });
  }
  ngAfterViewInit() {
    const perfectScrollbarContainer = $('.perfect-scrollbar-container');
    perfectScrollbarContainer.find('.ps__scrollbar-y-rail').css({ 'border-radius': '6px' });
    perfectScrollbarContainer.find('.ps__scrollbar-y-rail').css('cssText', 'width: 7px !important');
    perfectScrollbarContainer.find('.ps__scrollbar-y-rail').css({ 'background-color': 'rgba(255, 255, 255, 0.1)' });
    perfectScrollbarContainer.find('.ps__scrollbar-y-rail').css({ 'background-color': 'rgba(255, 255, 255, 0.1)' });
    perfectScrollbarContainer.find('.ps__scrollbar-y-rail').css({ 'opacity': 0.6 });

  }

  getEconomicPapers() {
    this._papersService.getPapers('economic').subscribe(data => {
      data.forEach((paper: any) => {
        this.economicPapers[paper.lang] = paper;
      });
      this.setEconomicPapers();
    });
  }
  setEconomicPapers() {
    const currentLanguagePaper = this.economicPapers[this.currentLanguage];
    const EnglishPaper = this.economicPapers['English'] || { url: '' };
    this.currentEconomicPaper = currentLanguagePaper ? currentLanguagePaper.url : EnglishPaper.url;
  }

  getWhitepapers() {
    this._papersService.getPapers('whitepaper').subscribe(data => {
      data.forEach((paper: any) => {
        this.whitePapers[paper.lang] = paper;
      });
      this.setEconomicPapers();
    });
  }
  setWhitepapers() {
    const currentWhitePaper = this.whitePapers[this.currentLanguage];
    const EnglishPaper = this.whitePapers['English'] || {url: ''};
    this.currentWhitePaper = currentWhitePaper ? currentWhitePaper.url : EnglishPaper.url;
  }

  toggleNotice(id) {
    const $notice = document.getElementById(id);
    const display = $notice.style.display;

    const $container = $('.aelf-notice-text');
    $container.css({ 'display': 'none' });

    const displayNew = display === 'block' ? 'none' : 'block';
    $notice.style.display = displayNew;
  }
  OnChange(languageSelection: string) {
    this._languageService.switchLanguage(this.languagesDic[languageSelection]);
    this.currentLanguage = languageSelection;
    this._fontFamlily.changeFontFamily(this.currentLanguage);
    this._cookieService.put('SelectedLanguage', this.languagesDic[languageSelection]);
    this.setVideo();
    this.getHotNews();
    this.setEconomicPapers();
    this.setWhitepapers();
  }

  getHotNews(language?: string) {
    this._newsService.getHotNews(language || this.currentLanguage).subscribe(data => {
      if (data.length <= 0 && this.getHotNewsRetryCount === 0) {
        this.getHotNewsRetryCount++;
        this.getHotNews('English');
        return;
      }
      this.getHotNewsRetryCount = 0;
      this.newsList = data;
    });
  }

  setVideo() {
    let videoSrcTemp = 'https://www.youtube.com/embed/qbIP1TEX33Q';
    if (this.currentLanguage === '中文') {
      videoSrcTemp = 'https://www.hoopox.com/aelf.mp4';
    }
    this.VideoSrc = this.sanitizer.bypassSecurityTrustResourceUrl(videoSrcTemp);
    setTimeout(() => {
      const videoWidth = parseInt($('#player').css('width'), 10);
      const videoHeight = (videoWidth / 16) * 9;
      $('#player').css('height', `${videoHeight}px`);
    }, 200);
  }

  // nav bar change color when the scroll event happens.
  @HostListener('window:scroll', ['$event'])
  scrollTop(event) {
    // console.log('Scroll Event', window.pageYOffset );
    // console.log('class name: ', $('#dropdown-pagination-menu').attr('class') );
    if (this._windowRef.nativeWindow.pageYOffset !== 0 && !($('#dropdown-pagination-menu').hasClass('active'))) {
      this.headerActiveCssClass = 'active-header';
    } else {
      this.headerActiveCssClass = '';
    }
    // console.log('headerActiveCssClass: ', this.headerActiveCssClass);
  }
  // add or delete active class for html header element when click menu button.
  menuClick() {
    if (this.headerActiveCssClass !== '' && !($('#dropdown-pagination-menu').hasClass('active'))) {
      this.headerActiveCssClass = '';
    } else if (this.headerActiveCssClass === '' && $('#dropdown-pagination-menu').hasClass('active') && (this._windowRef.nativeWindow.pageYOffset !== 0)) {
      this.headerActiveCssClass = 'active-header';
    }
  }

  @HostListener('window:resize') onresize() {
    const videoWidth = parseInt($('#player').css('width'), 10);
    const videoHeight = (videoWidth / 16) * 9;
    clearTimeout(this.resizeTime);
    this.resizeTime = setTimeout(() => {
      $('#player').css('height', `${videoHeight}px`);
    }, 100);
  }
}
$('body').on('click', '.lang-menu span', function(e){
  e.stopPropagation();
  $('.lang-menu').addClass('active2');
});

$('body').on('click', '.tool-menu span', function(e){
  e.stopPropagation();
  $('.tool-menu').addClass('active2');
});

window.onresize = function(){
  const videoWidth = parseInt($('#player').css('width'), 10);
  const videoHeight = (videoWidth / 16) * 9;
  $('#player').css('height', `${videoHeight}px`);
  // const vedioHeight = $('.vedio-size').find('.ptl22-box').css('height');
  // setTimeout(() => {
  //   $('#player').css('height', vedioHeight);
  // }, 200);
};


