<?php

namespace App\Console\Commands;

use DOMDocument;
use DOMElement;
use DOMXPath;
use Illuminate\Console\Command;

class ExportManualToJson extends Command
{
    protected $signature = 'vetoros:export-manual {--output=public/documentation/doc-vetoros.json : Caminho do arquivo JSON de saída, relativo à raiz do projeto}';

    protected $description = 'Converte public/documentation/doc-vetoros.html em JSON de tópicos para importar em /admin/help-topics';

    public function handle(): int
    {
        $htmlPath = public_path('documentation/doc-vetoros.html');

        if (! is_file($htmlPath)) {
            $this->error("Arquivo não encontrado: {$htmlPath}");

            return self::FAILURE;
        }

        $html = file_get_contents($htmlPath);

        $dom = new DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML('<?xml encoding="UTF-8">'.$html, LIBXML_NOERROR | LIBXML_NOWARNING);
        libxml_clear_errors();

        $xpath = new DOMXPath($dom);

        $this->convertCardGridsToLists($dom, $xpath);

        $sections = $xpath->query('//section[@id]');

        if ($sections === false || $sections->length === 0) {
            $this->error('Nenhuma <section id="..."> encontrada no manual.');

            return self::FAILURE;
        }

        $topics = [];
        $position = 0;

        foreach ($sections as $section) {
            /** @var DOMElement $section */
            $slug = $section->getAttribute('id');
            $heading = $xpath->query('.//h3', $section)->item(0);

            if (! $slug || ! $heading) {
                continue;
            }

            $title = trim(preg_replace('/^\d+\.\s*/', '', $heading->textContent));
            $content = $this->innerHtmlExcluding($dom, $section, $heading);

            if ($title === '' || trim($content) === '') {
                continue;
            }

            $topics[] = [
                'slug' => $slug,
                'title' => $title,
                'content' => $content,
                'category' => null,
                'position' => $position++,
            ];
        }

        $outputRelative = $this->option('output');
        $outputPath = base_path($outputRelative);

        if (! is_dir(dirname($outputPath))) {
            mkdir(dirname($outputPath), 0775, true);
        }

        file_put_contents(
            $outputPath,
            json_encode(['topics' => $topics], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );

        $this->info(count($topics)." tópico(s) exportado(s) para {$outputRelative}");

        return self::SUCCESS;
    }

    /**
     * O manual usa `<div class="grid"><div class="card">...` para exibir cartões lado a lado,
     * um layout que depende do CSS do próprio site do manual (não importado aqui). Convertemos
     * cada grid em uma lista simples (`<ul><li><strong>Título</strong>: texto</li>...</ul>`),
     * que renderiza corretamente com qualquer estilo.
     */
    private function convertCardGridsToLists(DOMDocument $dom, DOMXPath $xpath): void
    {
        $grids = iterator_to_array($xpath->query('//div[@class="grid"]'));

        foreach ($grids as $grid) {
            /** @var DOMElement $grid */
            $list = $dom->createElement('ul');

            foreach (iterator_to_array($xpath->query('.//div[@class="card"]', $grid)) as $card) {
                /** @var DOMElement $card */
                $item = $dom->createElement('li');
                $strong = $xpath->query('.//strong', $card)->item(0);

                foreach ($card->childNodes as $child) {
                    $item->appendChild($child->cloneNode(true));

                    if ($child === $strong) {
                        $item->appendChild($dom->createTextNode(': '));
                    }
                }

                $list->appendChild($item);
            }

            $grid->parentNode?->replaceChild($list, $grid);
        }
    }

    /**
     * Serializa os filhos de $node em HTML, pulando $exclude (o <h3> do título).
     */
    private function innerHtmlExcluding(DOMDocument $dom, DOMElement $node, \DOMNode $exclude): string
    {
        $html = '';

        foreach ($node->childNodes as $child) {
            if ($child === $exclude) {
                continue;
            }

            $html .= $dom->saveHTML($child);
        }

        return trim($html);
    }
}
