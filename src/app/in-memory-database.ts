// tslint:disable-next-line: eofline
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Category } from './pages/categories/shared/category.model';
import { Entry } from './pages/entries/shared/entry.model';

export class InMemoryDatabase implements InMemoryDbService {
    createDb() {
        const categories: Category[] = [
            { id: 1, name: 'Moradia', description: 'Pagamentos de contas da Casa' },
            { id: 2, name: 'Saúde', description: 'Plano de Saúde e Remédios' },
            { id: 3, name: 'Lazer', description: 'Cinema, Parques, Praia, etc...' },
            { id: 4, name: 'Salário', description: 'Recebimento de Salário' },
            { id: 5, name: 'Freelas', description: 'Trabalhos como freelancer' }
        ];

        const entries: Entry[] = [
            {
                id: 1,
                name: 'Oleo',
                categoryId: categories[1].id,
                category: categories[1],
                paid: true,
                date: '14/10/2018',
                amount: '70,80',
                type: 'expense'
            } as Entry,
        ];

        return { categories, entries };
    }
}
