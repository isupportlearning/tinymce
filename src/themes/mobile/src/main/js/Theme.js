define(
  'tinymce.themes.mobile.Theme',

  [
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.node.Element',
    'global!window',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.ThemeManager',
    'tinymce.core.ui.Api',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.ui.Buttons',
    'tinymce.themes.mobile.ui.ColorSlider',
    'tinymce.themes.mobile.ui.FontSizeSlider',
    'tinymce.themes.mobile.ui.ImagePicker',
    'tinymce.themes.mobile.ui.IosContainer',
    'tinymce.themes.mobile.ui.LinkButton',
    'tinymce.themes.mobile.util.CssUrls',
    'tinymce.themes.mobile.util.FormatChangers',
    'tinymce.themes.mobile.util.SkinLoaded'
  ],


  function (
    Cell, Fun, Element, window, DOMUtils, ThemeManager, Api, Styles, Buttons, ColorSlider, FontSizeSlider, ImagePicker, IosContainer, LinkButton, CssUrls, FormatChangers,
    SkinLoaded
  ) {
    ThemeManager.add('mobile', function (editor) {
      var renderUI = function (args) {
        var cssUrls = CssUrls.derive(editor);

        editor.contentCSS.push(cssUrls.content);
        DOMUtils.DOM.styleSheetLoader.load(cssUrls.ui, SkinLoaded.fireSkinLoaded(editor));

        var ios = IosContainer();
        args.targetNode.ownerDocument.body.appendChild(ios.element().dom());

        editor.on('init', function () {
          ios.init({
            editor: {
              getFrame: function () {
                return Element.fromDom(editor.contentAreaContainer.querySelector('iframe'));
              },

              onDomChanged: function () {
                return {
                  unbind: Fun.noop
                };
              },

              onTapContent: function () {
                ios.restoreToolbar();
              }
            },
            container: Element.fromDom(editor.editorContainer),
            socket: Element.fromDom(editor.contentAreaContainer),
            toolstrip: Element.fromDom(editor.editorContainer.querySelector('.' + Styles.resolve('toolstrip'))),
            toolbar: Element.fromDom(editor.editorContainer.querySelector('.' + Styles.resolve('toolbar')))
          });

          var createHeadingButton = function (level) {
            return Buttons.forToolbarStateAction(editor, level, function () {
              editor.execCommand('FormatBlock', null, level);
            });
          };

          var mainGroups = Cell([
            {
              label: 'The first group',
              scrollable: false,
              items: [
                Buttons.forToolbar('back', function (/* btn */) {
                  ios.exit();
                }, { })
              ]
            },
            {
              label: 'the action group',
              scrollable: true,
              items: [
                Buttons.forToolbarCommand(editor, 'undo'),
                Buttons.forToolbarStateCommand(editor, 'bold'),
                Buttons.forToolbarStateCommand(editor, 'italic'),
                createHeadingButton('h1'),
                createHeadingButton('h2'),
                createHeadingButton('h3'),
                // NOTE: Requires "lists" plugin.
                Buttons.forToolbarStateAction(editor, 'ul', function () {
                  editor.execCommand('InsertUnorderedList', null, false);
                }),
                LinkButton.sketch(ios, editor),
                ImagePicker.sketch(editor),
                FontSizeSlider.sketch(ios, editor),
                ColorSlider.sketch(ios, editor)
              ]
            },
            {
              label: 'The extra group',
              scrollable: false,
              items: [
                // This is where the "add button" button goes.
              ]
            }
          ]);

          ios.setToolbarGroups(mainGroups.get());

          // Investigate ways to keep in sync with the ui
          FormatChangers.init(ios, editor);
        });

        return {
          iframeContainer: ios.socket().element().dom(),
          editorContainer: ios.element().dom()
        };
      };

      return {
        renderUI: renderUI
      };
    });

    Api.appendTo(window.tinymce ? window.tinymce : {});

    return function () { };

  }
);
